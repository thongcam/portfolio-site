/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
declare module 'headroom.js';

declare namespace App {
  interface Locals {
    globalsPromise?: Promise<import("./utils/getGlobals").GlobalsData>;
  }
}
