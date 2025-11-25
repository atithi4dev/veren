import { Request, Response } from "express";
import fs from "fs";
import path from "path";

export default async function operationalController(req: Request, res: Response) {
    // Clones = {/clones/projectId}
    const { id } = req.body;
    console.log("OPERATIONAL CHECK FOR ID:", id);
    if (!id) {
        console.error("No project ID provided");
        return res.status(400).json({ message: "Project ID is required" });
    }
    if(fs.existsSync('/clones/' + id)) {
        console.log("Project is operational:", id);
        res.status(200).json({ message: `Project with ID ${id} is operational.` })
    }
    else {
        console.error("Project not found:", id);
        res.status(404).json({ message: `Project with ID ${id} not found.` })
    }
}