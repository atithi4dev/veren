import { Request, Response } from "express";

export async function repoHandler(req: Request, res: Response) {

    const token = req.session.githubToken;
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: No GitHub token found"
        });
    }

    try {
        const response = await fetch("https://api.github.com/user/repos?per_page=100", {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github.v3+json"
            },
        });
        if (!response.ok) {
            const text = await response.text();
            return res.status(response.status).json({
                success: false,
                message: "Failed to fetch repos",
                details: text
            });
        }

        const repos = await response.json();
        const simplified = repos.map((repo: any) => ({
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            private: repo.private,
            owner: {
                login: repo.owner.login,
                id: repo.owner.id
            }
        }));

        res.json({
            success: true,
            repos: simplified
        })

    } catch (error: any) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error fetching Github repos",
            error: error.message,
        });
    }
}


export async function repoFinder(req: Request, res: Response) {
    try {
        let query = (req.query.query as string | undefined)?.trim();
        if (!query) return res.status(400).json({ error: "Query is required" });

        const token = req.session.githubToken;
        let userRepos: any[] = [];
        let loggedInUser: string | null = null;

        // 1) LOAD LOGGED-IN USER + ALL PRIVATE & PUBLIC REPOS       
        if (token) {
            const me = await fetch("https://api.github.com/user", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const meJson = await me.json();
            loggedInUser = meJson.login;

            const privateResp = await fetch(
                `https://api.github.com/user/repos?per_page=200&visibility=all`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/vnd.github.v3+json"
                    },
                }
            );

            if (privateResp.ok) {
                const json = await privateResp.json();
                userRepos = json.map((r: any) => ({
                    fullName: r.full_name,
                    owner: r.owner.login,
                    repo: r.name,
                    private: r.private
                }));
            }
        }

        // 2) URL PARSING
        const githubUrlPattern = /github\.com\/([^\/]+)(?:\/([^\/]+))?/;
        const match = query.match(githubUrlPattern);

        let owner: string | null = null;
        let repo: string | null = null;

        if (match) {
            owner = match[1];
            repo = match[2] || null;
        }

        // Typing "/repo" -> assume logged-in user
        if (!owner && query.startsWith("/") && loggedInUser) {
            owner = loggedInUser;
            repo = query.slice(1);
        }

        // username/repo or username/partial
        if (!owner && query.includes("/")) {
            const [u, r] = query.split("/");
            owner = u || null;
            repo = r || null;
        }


        // 3) DIRECT MATCH FROM LOGGED-IN USER REPOS
        //    If user types a repo name directly

        if (!owner && loggedInUser) {
            const directMatches = userRepos.filter(r =>
                r.repo.toLowerCase().startsWith(query.toLowerCase())
            );

            if (directMatches.length > 0) {
                return res.json(dedup(directMatches));
            }
        }


        // 4) FULL MATCH CHECK ONLY WHEN REPO LOOKS COMPLETE
        const looksLikeFullRepo =
            owner &&
            repo &&
            /^[A-Za-z0-9_.-]+$/.test(repo) &&
            !repo.endsWith("/") &&
            !repo.endsWith("-") &&
            !repo.endsWith("_");

        if (looksLikeFullRepo) {
            const url = `https://api.github.com/repos/${owner}/${repo}`;
            const gh = await fetch(url);

            if (gh.ok) {
                const r = await gh.json();
                return res.json([
                    {
                        fullName: r.full_name,
                        owner: r.owner.login,
                        repo: r.name
                    }
                ]);
            }
        }


        // 5) PARTIAL REPO SEARCH (username/partial)
        if (owner && repo !== null) {
            // fetch public repos of the owner
            const url = `https://api.github.com/users/${owner}/repos?per_page=100`;
            const gh = await fetch(url);
            const publicJson = gh.ok ? await gh.json() : [];

            const publicFiltered = publicJson
                .filter((r: any) =>
                    r.name.toLowerCase().startsWith(repo.toLowerCase())
                )
                .map((r: any) => ({
                    fullName: `${r.owner.login}/${r.name}`,
                    owner: r.owner.login,
                    repo: r.name
                }));

            // filter logged-in user's private repos also
            const privateFiltered = userRepos.filter(r =>
                r.owner === owner &&
                r.repo.toLowerCase().startsWith(repo.toLowerCase())
            );

            return res.json(dedup([...publicFiltered, ...privateFiltered]));
        }


        // 6) ONLY USERNAME
        if (owner && repo === null) {
            const url = `https://api.github.com/users/${owner}/repos?per_page=100`;
            const gh = await fetch(url);

            const publicJson = gh.ok ? await gh.json() : [];

            const publicRepos = publicJson.map((r: any) => ({
                fullName: `${r.owner.login}/${r.name}`,
                owner: r.owner.login,
                repo: r.name
            }));

            // also include private repos
            const privateRepos = userRepos.filter(r => r.owner === owner);

            return res.json(dedup([...publicRepos, ...privateRepos]));
        }


        // 7) SEARCH FOR USERNAME ITSELF
        const url = `https://api.github.com/users/${query}/repos?per_page=100`;
        const gh = await fetch(url);

        const publicJson = gh.ok ? await gh.json() : [];
        const publicRepos = publicJson.map((r: any) => ({
            fullName: `${r.owner.login}/${r.name}`,
            owner: r.owner.login,
            repo: r.name
        }));

        return res.json(dedup(publicRepos));

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
}

// helper
function dedup(list: any[]) {
    const map = new Map();
    list.forEach(i => map.set(i.fullName, i));
    return Array.from(map.values());
}
