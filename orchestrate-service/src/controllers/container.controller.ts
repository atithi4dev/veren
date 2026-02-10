import {Request, Response} from 'express'
import ApiResponse from '../utils/api-utils/ApiResponse.js'
import Docker from 'dockerode'
import logger from "../logger/logger.js"

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

export async function containerRouter(req: Request, res: Response){
    const {image, tag = 'latest'} = req.body;
    let imageAlreadyExist = false;

    const images = await docker.listImages();

    for(const systemImage of images){
        for(const systemTag of systemImage.RepoTags!){
            if(systemTag === `${image}:${tag}`){
                imageAlreadyExist = true;
                break;
            }
        }

        if(imageAlreadyExist) break;
    }
    const imageName = `${image}:${tag}`;

    if(!imageAlreadyExist){
        logger.info(`Pulling Image: ${imageName}`);
        await docker.pull(imageName);
    }

    const container = await docker.createContainer({
        Image: imageName,
        Tty: false,
        HostConfig: {
            AutoRemove: true,
            NetworkMode: "veren"
        }
    })

    await container.start();

    res.status(200).json(new ApiResponse(200,container, 'Container is up and running'));
}

