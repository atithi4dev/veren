import {ECRClient, DescribeImagesCommand} from '@aws-sdk/client-ecr'

const client = new ECRClient({
    region: process.env?.AWS_REGION!
})

export default async function ecrImageExistsCheck(fullImageTag:string) {
    try {
        const {repositoryName, imageTag} = parseEcrImageUri(fullImageTag)
        console.log(fullImageTag);
        console.log(imageTag);
        await client.send(
            new DescribeImagesCommand({
                repositoryName: process.env?.BACKENDSTORAGELAYERREPO!,
                imageIds: [{imageTag}],
            })
        );
        return true;
    } catch (error: any) {
        if(error.name === "ImageNotFoundException") return false;
        throw error;
    }
}

function parseEcrImageUri(uri: string){
    const withoutRegistry = uri.split(".amazonaws.com/")[1];
    const [repositoryName, imageTag] = withoutRegistry.split(":");
    return {repositoryName, imageTag};
}