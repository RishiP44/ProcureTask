interface InviteEmailParams {
    to: string;
    name: string;
    invitedBy: string;
    token: string;
}

export const sendInviteEmail = async ({ to, name, invitedBy, token }: InviteEmailParams) => {
    console.log(`📧 Simulation: Sending invite email to ${to}`);
    console.log(`Hi ${name}, you have been invited by ${invitedBy} to join ProcureTask.`);
    console.log(`Use this token to complete your registration: ${token}`);
    const registrationLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/register?token=${token}`;
    console.log(`Link: ${registrationLink}`);
    return Promise.resolve();
};

interface TaskAssignmentEmailParams {
    to: string;
    employeeName: string;
    workflowName: string;
    assignedBy: string;
    assignmentId: string;
}

export const sendTaskAssignmentEmail = async ({
    to,
    employeeName,
    workflowName,
    assignedBy,
    assignmentId,
}: TaskAssignmentEmailParams) => {
    console.log(`📧 Simulation: Sending task assignment email to ${to}`);
    console.log(`Hi ${employeeName}, you have been assigned a new workflow: "${workflowName}" by ${assignedBy}.`);
    const assignmentLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/assignments/${assignmentId}`;
    console.log(`View Details: ${assignmentLink}`);
    return Promise.resolve();
};
