This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
## Automatisation Push des directs

Sur Vercel Hobby, cron-job.org appelle toutes les cinq minutes
`/api/internal/push/live-check` avec `CRON_SECRET`. Le secret est configuré
manuellement et ne doit jamais être ajouté au dépôt. L’automatisation reste inactive tant
que `PUSH_LIVE_AUTOMATION_ENABLED` n’est pas exactement égal à `true` sur
Vercel.

La détection automatique et la route publique `/api/youtube/live` n’utilisent
pas `search.list`. Elles lisent les dix éléments récents de la playlist uploads,
enrichissent tous leurs identifiants avec un unique `videos.list`, puis utilisent
`snippet.liveBroadcastContent` (`live`, `upcoming` ou `none`) comme source de
vérité. L’identifiant de la playlist uploads est obtenu par `channels.list` et
mis en cache 24 heures. Les lectures `playlistItems.list` et `videos.list`
restent en `no-store`. Aucun fallback vers `search.list` n’est autorisé dans le
polling automatique.

La détection des nouvelles vidéos dispose d’une route séparée
`/api/internal/push/video-check`. Elle utilise la playlist officielle des uploads
YouTube avec des lectures `no-store`. Tant que
`PUSH_VIDEO_AUTOMATION_ENABLED` n’est pas exactement égal à `true`, aucun Push
vidéo n’est envoyé : le baseline est initialisé puis avancé vers la publication
éligible la plus récente afin d’éviter tout backfill lors de l’activation. Une
fois activée, la route traite au maximum cinq publications parmi les dix plus
récentes, dans l’ordre chronologique, et exclut tout item possédant
`liveStreamingDetails` pour ne pas renotifier les archives de directs.

Lors du passage à Vercel Pro :

1. désactiver la tâche cron-job.org ;
2. recréer dans `vercel.json` un cron vers
   `/api/internal/push/live-check` avec le planning `* * * * *` ;
3. conserver `CRON_SECRET` et `PUSH_LIVE_AUTOMATION_ENABLED` ;
4. ne modifier ni le service Push ni son idempotence.
