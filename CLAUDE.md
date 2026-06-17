# CLAUDE.md — proband.xyz

This file gives Claude Code the context and rules for working in this repository.

---

## Project Context

**proband.xyz** is Sean Todd's personal agentic-safety research lab umbrella. It is
*not* affiliated with his employer (Coral AI / trycoral.ai); this is a separate
personal-research surface, not a Coral product.

The flagship project under the umbrella is **Argus**, an agentic-safety substrate
built on Llama-3.3-70B with LoRA fine-tuning around an enterprise IAM threat model.
Recent work demonstrated a decoupled gateway-executor architecture that outperforms
monolithic SFT across a 175-probe evaluation suite. Argus ships as a hardened
baseline plus a family of variants with different defense profiles (SFT, SFT+DPO,
Constitutional).

This repo holds the **public-facing site** for the lab — a landing page for the
project family, documentation for extending Argus (custom probes, personas,
substrates), and reference materials including failure-mode analyses and the
four-way architecture comparison. The site will initially be published using
**GitHub Pages**.

---

## Source Materials

Authoritative content for naming, positioning, and findings lives in the
companion research repo:

`/Users/seantodd/personal-projects/stac-ai-prototype`

Key files there (read as needed):

- **Substrate identity / positioning**
  - `docs/research/substrate_one_pager.md`
  - `docs/research/SESSION_REPORT_2026_06_14.md` (latest research arc)
- **Architecture and eval design**
  - `docs/research/v3_prod_eval_suite.md` — the 175-probe Argus eval design
  - `scripts/eval/run_v3_prod_eval_decoupled.py` — two-stage gateway-executor harness
  - `scripts/eval/run_v3_prod_eval.py` — monolithic baseline eval
  - `scripts/gateway/inject_cot_into_refusals.py` — training-corpus CoT injector
  - `scripts/gateway/synthesize_direct_refusal_e2_hard.py` — direct-refusal patch generator
- **Eval results (the four-way comparison — the published numbers)**
  - `data/gateway/v3_prod_r2_eval/cot_short/per_category_summary.md`
  - `data/gateway/v3_prod_r2_eval/cot_short_balanced/per_category_summary.md`
  - `data/gateway/v3_prod_r2_eval/cot_short_balanced_e2hard/per_category_summary.md`
  - `data/gateway/v3_prod_r2_eval/decoupled_e2hard_gateway_base_tool/per_category_summary.md`
- **Per-probe results (for failure-mode analyses)**
  - `data/gateway/v3_prod_r2_eval/*/results.json`

**Large artifacts on macstudio** (`ssh macstudio`, not in git):

- Trained LoRA adapters: `~/projects/stac-ai-prototype/data/gateway/adapters/{v3_prod_r2_cot_none,v3_prod_r2_cot_short,v3_prod_r2_cot_short_balanced,v3_prod_r2_cot_short_balanced_e2hard}/adapters.safetensors`
- Training corpora: `~/projects/stac-ai-prototype/data/gateway/v3_prod_r2/mix/*.jsonl`
- Base model cache: `~/.cache/huggingface/hub/models--mlx-community--Llama-3.3-70B-Instruct-bf16`

Selecting which subsets to publish (likely the decoupled-architecture variant,
the eval probes, the harness code) is design work — handled per-feature, not as
a setup-time decision.

---

## Project Rules

1. **Task tracking:** use `bd` (beads) — NOT TodoWrite or markdown TODOs. Run
   `bd prime` after compaction or new session start.
2. **Shell:** zsh, not bash. Prefer modern CLI tools — eza/rg/fd/bat over
   ls/grep/find/cat.
3. **No Coral content:** proband.xyz is Sean's personal lab; he works at Coral
   (sean.todd@trycoral.ai) but this is separate. Hard rule: do not source data,
   code, or examples from Coral systems even when MCP access is available.
4. **Plain language for eval terms:** translate eval-category labels (E1/E2/E3
   etc.) into prose in user-facing text. Code and tables can keep the labels.
5. **Don't abbreviate "adversarial" to "adv"** in user-facing text. Code field
   names can keep their existing forms.
6. **Substrate naming:** "Argus" is the v1 substrate; "proband.xyz" is the lab
   umbrella. "STAC" was an earlier project name — do not use it in any
   user-facing text.
7. **Substrate positioning:** Argus is a **hardened baseline + family of
   variants** with different defense profiles (SFT, SFT+DPO, Constitutional).
   NOT a "vulnerable target." Frame public docs accordingly.

---

## Deployment

Single static `index.html` at the repo root, served via GitHub Pages from
`proband-xyz/proband-xyz.github.io`. No build step.

Custom domain `proband.xyz` will attach once DNS is pointed at GitHub. Until
then the site serves at <https://proband-xyz.github.io/>. When DNS is ready,
add a `CNAME` file containing `proband.xyz` at the repo root and configure
the custom domain in the repo's Pages settings.
