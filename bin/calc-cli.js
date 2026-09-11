#!/usr/bin/env node
/**
 * investment-research-calc
 * Direct CLI binary for deterministic financial calculation & Gate G3 verification.
 */

import { runCli } from "../pipeline/calculator.mjs";

runCli(process.argv);
