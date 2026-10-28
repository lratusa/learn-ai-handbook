[中文](README.md) · [English](README.en.md) · [日本語](README.ja.md) · **Français**

# Apprendre l’IA avec les cours ouverts de Stanford : de zéro à entraîner des modèles et construire des agents soi-même

Un guide gratuit pour les diplômés et docteurs en ingénierie qui ont une solide formation technique mais n’ont jamais étudié l’IA. Il trace un parcours en cinq étapes fondé sur les cours ouverts de Stanford : quelles bases compléter, quels cours et quelles séances regarder ou sauter, et ce qu’il faut construire soi-même à chaque étape. À la fin, vous savez entraîner vos propres modèles et écrire votre propre agent et son harness.

**À lire en ligne :** [中文](https://www.gitechdesign.com/learn-ai/) · [English](https://www.gitechdesign.com/learn-ai/en/) · [日本語](https://www.gitechdesign.com/learn-ai/ja/) · [Français](https://www.gitechdesign.com/learn-ai/fr/)

![Apprendre l’IA avec les cours ouverts de Stanford](assets/og.png)

## Contenu

- **Cinq étapes et des options :** 0 bases → 1 apprentissage automatique (CS229) → 2 apprentissage profond et CNN (CS231n) → 3 grands modèles de langage (Karpathy, CS336) → 4 agents et harness (LLM Agents de Berkeley, CS329Z de Stanford), avec des options en apprentissage par renforcement, apprentissage sur graphes, modèles génératifs, optimisation convexe, etc. 25 cours au total.
- **Deux sources vidéo :** l’édition chinoise renvoie par défaut aux copies Bilibili sous-titrées en chinois, les autres éditions aux playlists YouTube officielles ; un bouton en haut de page permet de changer à tout moment. Chaque cours a aussi un lien de recherche de secours, le site du cours, les notes et les devoirs.
- **Jalons pratiques :** un petit projet et des critères de réussite à chaque étape. Les quatre blocs de code de la page sont exécutés par `test/snippets.py`, dont un agent minimal d’une soixantaine de lignes, en bibliothèque standard seule, avec bac à sable pour les outils, confirmation avant écriture et journal d’exécution.
- **Auto-évaluation :** sept questions pour savoir par quelle étape commencer.
- **Suivi de progression :** les cases cochées restent dans votre navigateur et ne sont jamais envoyées.
- **Quatre langues :** chinois, anglais, japonais et français, avec un glossaire de 26 termes dans les quatre langues.

## Déployer votre propre copie

Il suffit de Node.js 20 ou plus récent, sans autre dépendance.

```sh
git clone https://github.com/lratusa/learn-ai-handbook.git
cd learn-ai-handbook
node build.mjs            # écrit dans dist/ : le chinois à la racine, en/ ja/ fr/ en dessous
node tools/serve.mjs      # aperçu local sur http://127.0.0.1:8080/
```

`dist/` ne contient que des fichiers statiques, utilisables sur n’importe quel serveur web ou hébergement statique.

**Sous un sous-chemin ou votre propre domaine :** indiquez l’adresse publique au moment de la construction ; les chemins des ressources, les liens canonical et hreflang et les cartes de partage seront corrects.

```sh
SITE_URL=https://example.org/learn-ai node build.mjs            # macOS / Linux
$env:SITE_URL="https://example.org/learn-ai"; node build.mjs    # Windows PowerShell
```

Sans `SITE_URL`, les pages supposent la racine du site et omettent les balises SEO qui exigent une adresse absolue. `BASE_PATH=/learn-ai/` ne change que le chemin.

**GitHub Pages :** forkez ce dépôt → Settings → Pages → Build and deployment → Source : « GitHub Actions » → lancez « Deploy to GitHub Pages » depuis l’onglet Actions (la copie se met ensuite à jour à chaque push sur main). L’adresse est `https://<votre-identifiant>.github.io/learn-ai-handbook/`.

**Exemple nginx** (copiez `dist/` dans `/var/www/learn-ai/`) :

```nginx
location /learn-ai/ {
    alias /var/www/learn-ai/;
    index index.html;
}
```

Construisez alors avec `SITE_URL=https://votre-domaine/learn-ai`.

Une copie auto-hébergée ne diffère de l’édition officielle qu’en trois points : le pied de page indique qu’il s’agit d’une copie et renvoie à l’édition officielle ; notre numéro d’enregistrement ICP n’apparaît pas ; les liens vers d’autres pages du site GiTech (le compagnon CS329A, le rapport sur les modèles locaux) deviennent des URL complètes.

## Modifier le contenu, contribuer

| Pour changer | Modifiez |
|---|---|
| Cours, liens vidéo, notes, devoirs | `content/courses.mjs` |
| Textes (les quatre langues se correspondent un à un) | `content/i18n/zh.mjs`, `en.mjs`, `ja.mjs`, `fr.mjs` |
| Glossaire | `content/glossary.mjs` |
| Code de la page | `snippets/*.py` |
| Styles, comportement | `assets/style.css`, `assets/app.js` |

Puis lancez les tests :

```sh
node --test test/handbook.test.mjs   # même structure dans toutes les langues, variables et ancres, format des liens, typographie française, pages pour trois configurations de déploiement
python test/snippets.py              # exécute tout le code de la page (numpy et PyTorch requis ; le CPU suffit)
```

La vérification des liens externes demande `npm install` et un Chrome, Edge ou Chromium installé (indiquez-le avec `CHROME_PATH` s’il n’est pas trouvé) :

```sh
node build.mjs && node tools/check-links.mjs   # statut HTTP des sites de cours, de YouTube, des notes, etc.
node tools/check-bili.mjs                      # ouvre chaque vidéo Bilibili dans un navigateur et lit le titre, l’auteur et le nombre de parties
node tools/shoot.mjs                           # captures bureau et mobile, en testant l’auto-évaluation et le suivi de progression
```

Vérifiez les liens Bilibili comme le ferait un lecteur, une page à la fois dans un navigateur, et non par extraction massive via l’API. Un lien mort, un cours à ajouter ? Ouvrez une issue ou une pull request, ou écrivez à raymond@gitechdesign.com.

## Organisation

```
build.mjs              générateur : content/ + assets/ + snippets/ → dist/
config/default.mjs     réglages par défaut d’une copie (lit SITE_URL, BASE_PATH, ICP)
config/gitechdesign.mjs  réglages de l’édition officielle www.gitechdesign.com/learn-ai/
content/               données des cours, textes en quatre langues, glossaire
assets/                styles, script, image de partage, icônes
snippets/              le code Python affiché sur la page
test/                  tests des pages et du code
tools/                 aperçu local, vérification des liens, captures, contrôle en ligne
```

## Licence

- Code : [MIT](LICENSE).
- Contenu rédactionnel : [CC BY 4.0](LICENSE-CONTENT.md), avec la mention « GiTech Design (际和科技) ».
- Le nom et le logo GiTech ne sont pas sous licence. Les cours, vidéos et documents référencés appartiennent à l’université Stanford et aux universités, auteurs et chaînes indiqués sur chaque carte ; ce projet ne fait que les référencer et n’héberge aucune vidéo.

Rédigé par [GiTech Design](https://www.gitechdesign.com/fr/). Gratuit, sans publicité.
