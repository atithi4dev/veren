import { Request, Response } from "express";
import fs from "fs";
import path from "path";

export default async function operationalController(req: Request, res: Response) {
    // Clones = {/clones/projectId}
    const { id } = req.body;
    console.log("OPERATIONAL CHECK FOR ID:", id);
    return res.json({msg: "Operational controller is working", id});
}