// pokemon-data.js
// Dados da LuaHMoonMC
// Base histórica preservada + adições incrementais de 23/08/2026.

import {
  TYPE,
  TYPE_ORDER,
  RAW as BASE_RAW,
  GYM_STATS,
  META
} from "./pokemon-data-base-20260812.js";

export { TYPE, TYPE_ORDER, GYM_STATS, META };

export const RAW = [
  ...BASE_RAW,
  { name:"breloom", iv:100, types:["Grass","Fighting"] },
  { name:"scrafty", iv:100, types:["Dark","Fighting"] },
  { name:"mewtwo", iv:100, types:["Psychic"] },
  { name:"octillery", iv:100, types:["Water"] },
  { name:"incineroar", iv:100, types:["Fire","Dark"] },
  { name:"lapras", iv:100, types:["Water","Ice"] },
  { name:"lillipup", iv:53, types:["Normal"], shiny:true },
  { name:"jirachi", iv:82, types:["Steel","Psychic"] },
  { name:"azumarill", iv:91, types:["Water","Fairy"] },
  { name:"araquanid", iv:95, types:["Water","Bug"] },
  { name:"starmie", iv:100, types:["Water","Psychic"], favorite:true },
  { name:"tentacruel", iv:100, types:["Water","Poison"] },
  { name:"eevee", iv:86, types:["Normal"], dynamax:true },
  { name:"huntail", iv:100, types:["Water"] },
  { name:"gyarados", iv:100, types:["Water","Flying"] },
  { name:"mawile", iv:100, types:["Steel","Fairy"] },
  { name:"emolga", iv:100, types:["Electric","Flying"] },
  { name:"gyarados", iv:100, types:["Water","Flying"], favorite:true, shiny:true },
  { name:"toxicroak", iv:100, types:["Poison","Fighting"] },
  { name:"feebas", iv:100, types:["Water"] },
  { name:"kingler", iv:100, types:["Water"], favorite:true },
];
