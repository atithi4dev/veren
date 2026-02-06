export async function folderCheck(repoUrl: string, path: string, branch = "main") {
    try {
        const url = new URL(repoUrl);
        const token = url.username ? url.username : '';
        const [owner, repo] = url.pathname.replace(/^\/|\.git$/g, "").split("/");

        if (!owner || !repo) throw new Error("Invalid GitHub repo URL");
        
        if(path.includes('./')){
            path = path.split('./')[1];
        }

        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

        const headers: any = { Accept: "application/vnd.github.v3+json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        const response = await fetch(apiUrl, { headers });
        if (response.status === 404) return false;

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`GitHub API error: ${response.status} - ${text}`);
        }

        const data = await response.json();
        const isFolder = Array.isArray(data);

        // Lol i will surely remove it , PINKY PROMISE HAHAHAHAHAHHA!
        return true;
    } catch (error: any) {
        console.error("Error checking folder:", error);
    }
}