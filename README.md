# RocketBot Workspace

Monorepo se dvěma větvemi vývoje Discord bota:

- discordbot-rocket: aktuálně spustitelná verze (Node.js, prefix příkazy)
- discordbot-rocket-v3: nová architektura ve výstavbě (backend/frontend skeleton)

## Obsah repozitáře

- README.md: tento přehled
- .instructions.md: projektové instrukce pro AI asistenta
- discordbot-rocket: běžící implementace
- discordbot-rocket-v3: připravovaná verze

## Rychlý start (discordbot-rocket)

Požadavky:

- Node.js 18+
- npm

Postup:

1. Otevři složku discordbot-rocket
2. Nainstaluj závislosti: npm install
3. Vytvoř .env soubor se secretem DISCORD_TOKEN
4. Spusť vývoj: npm run dev
5. Spusť produkčně: npm start

Definice skriptů je v souboru discordbot-rocket/package.json.

## Jak bot funguje (aktuální verze)

Vstup aplikace:

- [index.js](http://_vscodecontentref_/0)

Načítání commandů:

- [loadCommands.js](http://_vscodecontentref_/1)

Zpracování zpráv:

- [messageCreate.js](http://_vscodecontentref_/2)

Aktuálně:

- používá se prefix !
- příkazy se načítají rekurzivně ze složky discordbot-rocket/src/commands

## Struktura projektu

Aktuální bot:

- discordbot-rocket/src/application
- discordbot-rocket/src/bootstrap
- discordbot-rocket/src/commands
- discordbot-rocket/src/events
- discordbot-rocket/src/music
- discordbot-rocket/src/infra

V3 skeleton:

- discordbot-rocket-v3/src/backend
- discordbot-rocket-v3/src/frontend
- discordbot-rocket-v3/config

## Konvence a AI instrukce

Projektové konvence (pojmenování, modularita, DI, workflow) jsou v:

- [.instructions.md](http://_vscodecontentref_/3)

Doporučení:

- držet názvy tříd v PascalCase
- commandy/eventy psát v camelCase
- logiku držet v services/module vrstvě, ne v command handleru

## Stav vývoje

- discordbot-rocket: funkční základ pro Discord bot příkazy
- discordbot-rocket-v3: připravená adresářová architektura, zatím bez [package.json](http://_vscodecontentref_/4) a bez runtime bootstrapu
