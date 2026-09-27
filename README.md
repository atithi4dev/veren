<div align="center">
  <h1>VEREN</h1>
  <p><em>Push your code. Get a live URL. No cold starts, no sleeping servers.</em></p>
</div>

<p align="center">
  <a href="https://github.com/atithi4dev/veren/stargazers"><img src="https://img.shields.io/github/stars/atithi4dev/veren?style=flat-square" alt="Stars"></a>
  <a href="https://github.com/atithi4dev/veren/releases"><img src="https://img.shields.io/github/v/release/atithi4dev/veren?include_prereleases&label=release&style=flat-square" alt="Release"></a>
  <a href="https://github.com/atithi4dev/veren/blob/main/LICENSE"><img src="https://img.shields.io/github/license/atithi4dev/veren?style=flat-square" alt="License"></a>
  <a href="https://github.com/atithi4dev/veren/commits"><img src="https://img.shields.io/github/commit-activity/m/atithi4dev/veren?style=flat-square" alt="Commits"></a>
  <a href="https://github.com/atithi4dev/veren/issues"><img src="https://img.shields.io/github/issues/atithi4dev/veren?style=flat-square" alt="Issues"></a>
  <a href="https://discord.gg/tACgSEYz"><img src="https://img.shields.io/badge/chat-Discord-5865F2?style=flat-square&logo=Discord&logoColor=white" alt="Discord"></a>
</p>

<p align="center">
  <img src="https://res.cloudinary.com/dgnj1rfng/image/upload/v1790512164/veren.png" alt="Veren preview" width="1000" />
</p>

## What is Veren?

You connect a GitHub repo, Veren builds it and deploys it, and you get a link you can share right away.

Most free deployment tools put your app to sleep when nobody's visiting, to save money. Sounds fine until someone actually clicks your link and sits there waiting for it to wake up. Veren doesn't do that. Once your app is deployed, it stays running — so the link just works, every time, for whoever opens it.

Behind that link, Veren isn't one big process doing everything. A gateway handles your requests, workers pick up build and deploy jobs from a queue, isolated containers do the actual building, and a routing service sends traffic to the right place. Keeping backends always-on is what makes that split necessary — someone has to track running services, IPs, and routes instead of just spinning things up on demand.

## What you get

- **A live URL from a repo** — connect GitHub, pick a branch, deploy
- **No cold starts** — your backend stays up, no waiting around for the first request
- **Deploys on push** — set it up once, every push redeploys automatically
- **Isolated builds** — each build runs in its own sandboxed container, so one project's build can't touch another's
- **Real build logs** — watch your build happen instead of guessing why it failed
- **One-click rollback** — something broke? Go back to the last build that worked
- **Frontend and backend, both covered** — static sites go to S3 + CDN, backends run as always-on services

## Guides

| Guide | Description |
|---|---|
| [Getting Started](https://github.com/atithi4dev/veren/blob/main/Docs/GETTING_STARTED.md) | Local setup and development workflow |
| [Architecture](https://github.com/atithi4dev/veren/blob/main/Docs/ARCHITECTURE.md) | System design, event model, and tradeoffs |
| [API Walkthrough](https://github.com/atithi4dev/veren/blob/main/Docs/api-docs/API.md) | REST API reference |
| [Builder Images Mapping](https://github.com/atithi4dev/veren/blob/main/Docs/BUILDER_IMAGES_MAPPING.md) | ECS task and builder image configuration |

## Quick Start

```bash
git clone <repository-url>
cd veren
sudo docker compose -f docker-compose.dev.yml up --build
```

Environment configuration, webhook forwarding, and frontend setup are covered in [Getting Started](https://github.com/atithi4dev/veren/blob/main/Docs/GETTING_STARTED.md).

## Contributing

This project began as a learning exercise and is not actively maintained on a long-term roadmap by the [owner](https://github.com/atithi4dev). Contributions are welcome regardless — issues and pull requests, including small ones, are reviewed as time allows. There are no formal contribution requirements; clarity and intent matter more than polish.

## Support

- [Issues](https://github.com/atithi4dev/veren/issues)
- [Discord](https://discord.gg/tACgSEYz)
- [Email](mailto:atithisingh.dev@gmail.com)

## License

See [LICENSE](https://github.com/atithi4dev/veren/blob/main/LICENSE).

<div align="center">

Made by <a href="https://github.com/atithi4dev">@atithi4dev</a>

</div>