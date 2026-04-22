// Mock email service
export const sendTaskAssignmentEmail = async (data: {
    to: string;
    employeeName: string;
    workflowName: string;
    assignedBy: string;
    assignmentId: string;
}) => {
    console.log(`📧 Simulation: Sending Task Assignment Email to ${data.to}`);
    console.log(`Content: Hi ${data.employeeName}, ${data.assignedBy} assigned you ${data.workflowName}.`);
    return Promise.resolve();
};

export const sendInviteEmail = async (data: {
    to: string;
    name: string;
    invitedBy: string;
    token: string;
}) => {
    console.log(`📧 Simulation: Sending Invite Email to ${data.to}`);
    console.log(`Content: Hi ${data.name}, you have been invited by ${data.invitedBy}. Token: ${data.token}`);
    return Promise.resolve();
};
