export const frontendConfig18 = {
    CLUSTER: process.env.AWS_FRONTEND_CLUSTER,
    TASK: process.env.TASK18,
    CONTAINERNAME:process.env.FRONTEND18CONTAINER
}

export const frontendConfig20 = {
    CLUSTER: process.env.AWS_FRONTEND_CLUSTER,
    TASK: process.env.TASK20,
    CONTAINERNAME: process.env.FRONTEND18CONTAINER
}

export const backendECSConfig = {
    CLUSTER: process.env.AWS_BACKEND_CLUSTER,
    TASK: process.env.TASKBACKEND,
    CONTAINERNAME:process.env.BACKEND_CONTAIENR
}
