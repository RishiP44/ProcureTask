import request from 'supertest';
import app from '../server';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../models/User';
import Workflow from '../models/Workflow';
import Assignment from '../models/Assignment';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
});

describe('ProcureTask API Tests', () => {

    describe('1. Authentication & Authorization', () => {
        let testUser: any;
        const testPassword = 'Password123!';

        beforeEach(async () => {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(testPassword, salt);
            testUser = await User.create({
                name: 'Test Employee',
                email: 'employee@test.com',
                passwordHash: hashedPassword,
                role: 'Employee'
            });
        });

        it('should login and return a token for valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'employee@test.com', password: testPassword });
            
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body).toHaveProperty('_id');
            expect(res.body.role).toBe('Employee');
        });

        it('should reject invalid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'employee@test.com', password: 'WrongPassword' });
            
            expect([400, 401]).toContain(res.status); // Accepts either standard auth failure code
            expect(res.body).not.toHaveProperty('token');
        });
    });

    describe('3. Workflow Creation API (RBAC Enforcement)', () => {
        let adminToken: string;
        let employeeToken: string;
        let adminId: mongoose.Types.ObjectId;

        beforeEach(async () => {
            const admin = await User.create({
                name: 'Admin', email: 'admin@test.com', passwordHash: 'pass', role: 'Admin'
            });
            const employee = await User.create({
                name: 'Employee', email: 'emp@test.com', passwordHash: 'pass', role: 'Employee'
            });
            
            adminId = admin._id as mongoose.Types.ObjectId;

            adminToken = jwt.sign({ id: admin._id.toString(), role: admin.role }, process.env.JWT_SECRET || 'secret');
            employeeToken = jwt.sign({ id: employee._id.toString(), role: employee.role }, process.env.JWT_SECRET || 'secret');
        });

        it('should allow Admins to create workflows', async () => {
            const workflowPayload = {
                name: 'Test Workflow',
                description: 'This is a test workflow',
                tasks: [{ name: 'Task 1', description: 'Desc 1', type: 'checkbox', required: true }]
            };
            const res = await request(app)
                .post('/api/workflows')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(workflowPayload);
            
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.name).toBe('Test Workflow');
        });

        it('should prevent Employees from creating workflows', async () => {
            const workflowPayload = {
                name: 'Test Workflow',
                description: 'This is a test workflow',
                tasks: [{ name: 'Task 1', description: 'Desc 1', type: 'checkbox', required: true }]
            };
            const res = await request(app)
                .post('/api/workflows')
                .set('Authorization', `Bearer ${employeeToken}`)
                .send(workflowPayload);
            
            expect([401, 403]).toContain(res.status);
            
            const count = await Workflow.countDocuments();
            expect(count).toBe(0);
        });
    });

    describe('5. Task Assignment API', () => {
        let adminToken: string;
        let adminId: mongoose.Types.ObjectId;
        let employeeId: mongoose.Types.ObjectId;
        let workflowId: mongoose.Types.ObjectId;

        beforeEach(async () => {
            const admin = await User.create({ name: 'Admin', email: 'admin@test.com', passwordHash: 'pass', role: 'Admin' });
            adminToken = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET || 'secret');
            adminId = admin._id as mongoose.Types.ObjectId;
            
            const employee = await User.create({ name: 'Employee', email: 'emp@test.com', passwordHash: 'pass', role: 'Employee' });
            employeeId = employee._id as mongoose.Types.ObjectId;

            const workflow = await Workflow.create({
                name: 'Onboarding',
                description: 'New hire onboarding',
                createdBy: adminId,
                tasks: [{ name: 'Sign Doc', description: 'Sign contract', type: 'document', required: true }]
            });
            workflowId = workflow._id as mongoose.Types.ObjectId;
        });

        it('should assign a workflow to a user and generate tasks', async () => {
            const res = await request(app)
                .post('/api/assignments')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ workflowId, userId: employeeId });
            
            expect(res.status).toBe(201);
            
            const assignments = await Assignment.find({ user: employeeId });
            expect(assignments.length).toBe(1);
            expect(assignments[0].tasks.length).toBe(1);
            expect(assignments[0].tasks[0].status).toBe('pending');
        });
    });

    describe('7. Task Status Update API', () => {
        let employeeToken: string;
        let assignmentId: string;
        let taskId: string;

        beforeEach(async () => {
            const admin = await User.create({ name: 'Admin', email: 'admin2@test.com', passwordHash: 'pass', role: 'Admin' });
            const employee = await User.create({ name: 'Employee', email: 'emp@test.com', passwordHash: 'pass', role: 'Employee' });
            employeeToken = jwt.sign({ id: employee._id.toString(), role: employee.role }, process.env.JWT_SECRET || 'secret');
            
            const workflow = await Workflow.create({
                name: 'Onboarding',
                description: '...',
                createdBy: admin._id as mongoose.Types.ObjectId,
                tasks: [{ name: 'Task A', description: '...', type: 'checkbox', required: true }]
            });

            const assignment = await Assignment.create({
                workflow: workflow._id,
                user: employee._id,
                assignedBy: admin._id,
                status: 'pending',
                tasks: [{
                    name: 'Task A',
                    description: '...',
                    type: 'checkbox',
                    required: true,
                    status: 'pending'
                }]
            });
            assignmentId = assignment._id.toString();
            taskId = assignment.tasks[0]._id.toString();
        });

        it('should mark a task as completed', async () => {
            const res = await request(app)
                .put(`/api/assignments/${assignmentId}/tasks/${taskId}`)
                .set('Authorization', `Bearer ${employeeToken}`)
                .send({ status: 'completed' });
            
            expect(res.status).toBe(200);
            
            const updatedAssignment = await Assignment.findById(assignmentId);
            expect(updatedAssignment?.tasks[0].status).toBe('completed');
        });
    });

    describe('8. File Type and Size Validation API', () => {
        let userToken: string;

        beforeEach(async () => {
            const employee = await User.create({ name: 'Employee', email: 'emp@test.com', passwordHash: 'pass', role: 'Employee' });
            userToken = jwt.sign({ id: employee._id.toString(), role: employee.role }, process.env.JWT_SECRET || 'secret');
        });

        it('should reject unsupported file types', async () => {
            const tempFilePath = path.join(__dirname, 'test.txt');
            fs.writeFileSync(tempFilePath, 'dummy content');

            const res = await request(app)
                .post('/api/upload')
                .set('Authorization', `Bearer ${userToken}`)
                .attach('file', tempFilePath);
            
            fs.unlinkSync(tempFilePath);
            
            expect(res.status).toBe(500);
            expect(res.text).toMatch(/Images and PDFs only/i);
        });
    });

});
