// pokemon-data.js
// Dados da LuaHMoonMC
// Base histórica preservada + adições incrementais de 23/08/2026 e 30/08/2026.

import {
  TYPE,
  TYPE_ORDER,
  RAW as BASE_RAW,
  GYM_STATS as BASE_GYM_STATS,
  META as BASE_META
} from "./pokemon-data-base-20260812.js";

export { TYPE, TYPE_ORDER };

export const GYM_STATS = {
  gymsDefeated: 2228,
  get hoursLeading(){
    return BASE_GYM_STATS.hoursLeading;
  }
};

export const META = {
  ...BASE_META,
  lastUpdated: "2026-08-30"
};

// Evoluções de exemplares que ainda vivem no baseline histórico.
// Remove somente a primeira ocorrência exata para não apagar duplicatas legítimas.
let frogadier95Replaced = false;
const CURRENT_BASE_RAW = BASE_RAW.filter(p => {
  if(!frogadier95Replaced && p.name === "frogadier" && p.iv === 95){
    frogadier95Replaced = true;
    return false;
  }
  return true;
});

export const RAW = [
  ...CURRENT_BASE_RAW,
  { name:"breloom", iv:100, types:["Grass","Fighting"] },
  { name:"scrafty", iv:100, types:["Dark","Fighting"] },
  { name:"mewtwo", iv:100, types:["Psychic"] },
  { name:"octillery", iv:100, types:["Water"] },
  { name:"incineroar", iv:100, types:["Fire","Dark"] },
  { name:"lapras", iv:100, types:["Water","Ice"] },
  { name:"lillipup", iv:53, types:["Normal"], shiny:true },
  { name:"jirachi", iv:82, types:["Steel","Psychic"], favorite:true },
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
  { name:"malamar", iv:100, types:["Dark","Psychic"] },
  { name:"lunala", iv:84, types:["Psychic","Ghost"] },
  { name:"lunala", iv:93, types:["Psychic","Ghost"] },
  { name:"lickitung", iv:100, types:["Normal"] },
  { name:"snorlax", iv:100, types:["Normal"] },
  { name:"zweilous", iv:100, types:["Dark","Dragon"] },
  { name:"sealeo", iv:100, types:["Ice","Water"] },
  { name:"latias", iv:93, types:["Dragon","Psychic"] },
  { name:"wormadam", iv:100, types:["Bug","Grass"] },
  { name:"regice", iv:88, types:["Ice"] },
  { name:"deerling", iv:100, types:["Normal","Grass"] },
  { name:"gligar", iv:100, types:["Ground","Flying"] },
  { name:"registeel", iv:82, types:["Steel"] },
  { name:"corsola", iv:93, types:["Water","Rock"] },
  { name:"croconaw", iv:100, types:["Water"] },
  { name:"greninja", iv:95, types:["Water","Dark"] },
];
