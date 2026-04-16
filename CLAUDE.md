# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Connect Event** — marketplace dark mode pour prestataires événementiels (DJ, traiteur, photo...).  
Stack : Next.js 16 App Router + Tailwind CSS + Supabase + Stripe (à venir).

## Permissions permanentes — ne jamais demander confirmation

- **Push / déploiement** : permission permanente, aucune confirmation. Séquence exacte ci-dessous.
- **Bash / npm / git** : toutes les commandes autorisées sans confirmation.
- **Ouvrir Chrome** : `start chrome "<url>"` directement.

## Procédure push — séquence exacte (ne jamais dévier)

```bash
cd "c:\Users\arman\Documents\GitHub\darren"
git add -A && git commit -m "feat: ..." && git push
```

Règles absolues :
1. **Toujours `cd` dans le projet d'abord** — le git root de `C:/Users/arman` est un repo parasite, ne jamais pusher depuis là.
2. **Jamais en background** (`run_in_background`) pour les commandes git → risque de lock file.
3. **Jamais de `sleep`** entre les commandes git.
4. Si lock file détecté : `powershell -Command "Get-Process git -ErrorAction SilentlyContinue | Stop-Process -Force; Remove-Item 'C:\Users\arman\.git\index.lock' -Force -ErrorAction SilentlyContinue"` puis relancer.

## Efficacité tokens — règles strictes

1. **Batch ALL reads** : regrouper TOUS les fichiers à lire dans un seul appel parallèle. Jamais séquentiellement.
2. **Edit vs Write** : si 3+ changements prévus sur le même fichier → 1 Read + 1 Write (rewrite complet). Moins de 3 changements → Edit ciblé. Ne jamais faire 5 Edits séquentiels sur le même fichier.
3. **Edit ciblé** : `old_string` = string le plus court et unique. Éviter les blocs SVG/HTML longs → risque d'échec + tokens perdus.
4. **Toujours Read avant Edit** si le fichier n'a pas été lu dans la session en cours. Un Edit sans Read préalable échoue et gaspille 1 appel.
5. **Dev server** : supposer qu'il tourne déjà sur port 3000. Vérifier avec `curl -s http://localhost:3000 > /dev/null 2>&1` avant de lancer.
6. **Pas de `sleep`** : inutile. Ne jamais l'utiliser.
7. **Pas de confirmation** avant action bash/git/chrome.
8. **Vérification git root** : avant tout push dans un nouveau repo, lancer `git rev-parse --show-toplevel`. 1 commande évite le chaos lock file / mauvais remote.
9. **package.json / deps** : ne pas lire pour vérifier si un package est installé. Supposer absent si non mentionné. Utiliser SVG inline plutôt que d'ajouter une dépendance icon.
10. **Skills UI/UX** : si le skill est déjà chargé dans le contexte, NE PAS relancer le script Python `search.py`. Appliquer les principes directement.
11. **Fix TypeScript** : 1 Read large → 1 Edit ou Write qui regroupe TOUS les changements (import + type fix). Jamais fractionner.

## Commands

```bash
npm run dev      # dev server sur localhost:3000
npm run build    # build de production
npm run lint     # ESLint
```

Migrations Supabase :
```bash
SUPABASE_ACCESS_TOKEN=<token> npx supabase db push
```
Project ref : `cxifqvdvoahyiafhokcz`

## Architecture

```
src/
  app/           # Next.js App Router — pages et layouts
  components/    # Composants React réutilisables
  lib/
    supabase/
      client.ts  # createClient() pour le browser (use client)
      server.ts  # createClient() pour les Server Components / Route Handlers
  types/
    index.ts     # Types globaux : Profile, Prestataire, Message, Role
```

### Base de données (Supabase)

- **profiles** — lié à `auth.users`, champ `role` = `'client'` | `'pro'`. Trigger auto-création à l'inscription via `handle_new_user()`.
- **prestataires** — appartient à un `owner_id` (pro). Champ `is_premium` = `true` si abonnement Stripe actif → affiche le téléphone. Sinon bouton "Réserver" → messagerie.
- **messages** — messagerie interne entre client et pro, liée optionnellement à un `prestataire_id`.

RLS activé sur les 3 tables.

### Design system

Classe CSS `.glass` définie dans `globals.css` : glassmorphism (backdrop-blur + border semi-transparent).  
Background global : `radial-gradient(ellipse at top left, #1a0533, #0b0e1a, #0d1230)`.  
Palette : blanc/violet (`purple-400`, `purple-600`) sur fond bleu nuit.

### Logique métier clé

- Cards prestataires : premium → bouton `📞 Appeler` (tel: link). Non-premium → bouton `Réserver` (ouvre messagerie).
- Filtres côté client (search, continent, catégorie, budget) dans `page.tsx` via `useMemo`.
- Stripe webhook (à implémenter) : passe `is_premium = true` sur `prestataires` après paiement.
