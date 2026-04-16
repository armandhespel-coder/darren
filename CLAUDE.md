# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Connect Event** — marketplace dark mode pour prestataires événementiels (DJ, traiteur, photo...).  
Stack : Next.js 16 App Router + Tailwind CSS + Supabase + Stripe (à venir).

## Permissions permanentes — ne jamais demander confirmation

- **Push / déploiement** : `git add -A && git commit -m "..." && git push` directement.
- **Bash / npm / git** : toutes les commandes autorisées sans confirmation.
- **Ouvrir Chrome** : `start chrome "<url>"` directement.

## Efficacité tokens — règles strictes

1. **Batch ALL reads** : regrouper TOUS les fichiers à lire dans un seul appel parallèle. Jamais séquentiellement.
2. **Dev server** : supposer qu'il tourne déjà sur port 3000 depuis la session précédente. Vérifier avec `curl -s http://localhost:3000 > /dev/null 2>&1` avant de lancer. Ne pas lancer si déjà actif.
3. **Pas de `sleep`** : commande bloquée, inutile. Ne jamais l'utiliser.
4. **Edit ciblé** : `old_string` = string le plus court et unique. Éviter les blocs SVG/HTML longs → risque d'échec + tokens perdus.
5. **Write uniquement pour réécriture complète** — sinon Edit.
6. **Pas de confirmation** avant action bash/git/chrome.
7. **Skills UI/UX** : si le skill est déjà chargé dans le contexte, NE PAS relancer le script Python `search.py`. Appliquer les principes directement depuis le contenu du skill. Le script est redondant.
8. **package.json / deps** : ne pas lire pour vérifier si un package est installé. Supposer absent si non mentionné. Utiliser SVG inline plutôt que d'ajouter une dépendance icon.

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
