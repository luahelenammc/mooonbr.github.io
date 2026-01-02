// pokemon-data.js
// Dados da LuaHMoonMC

export const TYPE = {
  Normal:   { pt:"Normal",   c:"#A8A77A" },
  Fire:     { pt:"Fogo",     c:"#EE8130" },
  Water:    { pt:"Água",     c:"#6390F0" },
  Electric: { pt:"Elétrico", c:"#F7D02C" },
  Grass:    { pt:"Planta",   c:"#7AC74C" },
  Ice:      { pt:"Gelo",     c:"#96D9D6" },
  Fighting: { pt:"Lutador",  c:"#C22E28" },
  Poison:   { pt:"Venenoso", c:"#A33EA1" },
  Ground:   { pt:"Terra",    c:"#E2BF65" },
  Flying:   { pt:"Voador",   c:"#A98FF3" },
  Psychic:  { pt:"Psíquico", c:"#F95587" },
  Bug:      { pt:"Inseto",   c:"#A6B91A" },
  Rock:     { pt:"Pedra",    c:"#B6A136" },
  Ghost:    { pt:"Fantasma", c:"#735797" },
  Dragon:   { pt:"Dragão",   c:"#6F35FC" },
  Dark:     { pt:"Sombrio",  c:"#705746" },
  Steel:    { pt:"Aço",      c:"#B7B7CE" },
  Fairy:    { pt:"Fada",     c:"#D685AD" }
};

export const TYPE_ORDER = [
  "All","Normal","Fire","Water","Electric","Grass","Ice","Fighting","Poison","Ground",
  "Flying","Psychic","Bug","Rock","Ghost","Dragon","Dark","Steel","Fairy"
];

  export const RAW = [
// ACRESCENTAR ABAIXO!


    { name:"drowzee", iv:95, types:["Psychic"] }, 
{ name:"psyduck", iv:93, types:["Water"] }, 
    { name:"heracross", iv:93, types:["Bug","Fighting"], shiny:true }, 
{ name:"haunter", iv:97, types:["Ghost","Poison"] },
{ name:"typhlosion", iv:95, types:["Fire"] },
{ name:"eevee", iv:91, types:["Normal"] },
{ name:"graveler", iv:91, types:["Rock","Ground"] },
{ name:"skitty", iv:93, types:["Normal"] },
{ name:"koffing", iv:95, types:["Poison"] },
{ name:"eevee", iv:93, types:["Normal"], dynamax:true }, 
    
{ name:"pelipper", iv:97, types:["Water","Flying"] },    
{ name:"electrode", iv:97, types:["Electric"] },    
{ name:"panpour", iv:93, types:["Water"] },    
{ name:"ledian", iv:91, types:["Bug","Flying"] },    
{ name:"butterfree", iv:93, types:["Bug"] },
{ name:"whirlipede", iv:97, types:["Bug","Poison"] },
{ name:"flaaffy", iv:97, types:["Electric"] },
{ name:"venomoth", iv:93, types:["Bug","Poison"] },
{ name:"flareon", iv:93, types:["Fire"] },
{ name:"baltoy", iv:97, types:["Ground","Psychic"] },
{ name:"xatu", iv:97, types:["Psychic","Flying"] },
{ name:"noctowl", iv:97, types:["Normal","Flying"], xmas:true },
{ name:"ralts", iv:86, types:["Psychic","Fairy"], dynamax:true }  , 
{ name:"cetitan", iv:100, types:["Ice"] },
{ name:"nidorina", iv:100, types:["Poison"] },
{ name:"stufful", iv:100, types:["Normal","Fighting"] },
{ name:"wigglytuff", iv:100, types:["Normal","Fairy"] },

{ name:"cetoddle", iv:97, types:["Ice"] },
{ name:"gulpin", iv:97, types:["Poison"] },
{ name:"medicham", iv:97, types:["Fighting","Psychic"] },

    { name:"mismagius", iv:95, types:["Ghost"] },
{ name:"kadabra", iv:95, types:["Psychic"] },
{ name:"arbok", iv:93, types:["Poison"] },
{ name:"charmeleon", iv:95, types:["Fire"] },
{ name:"haunter", iv:95, types:["Ghost","Poison"] },
{ name:"kirlia", iv:95, types:["Psychic","Fairy"] },
{ name:"wobbuffet", iv:95, types:["Psychic"] },

{ name:"sandslash-alola", iv:91, types:["Ice","Steel"] },

{ name:"arcanine", iv:93, types:["Fire"] },
{ name:"dugtrio-alola", iv:93, types:["ground"] },
{ name:"kakuna", iv:93, types:["Bug","Poison"] },
{ name:"magikarp", iv:93, types:["Water"] },
{ name:"nidoran", iv:93, types:["Poison"] },
{ name:"sentret", iv:93, types:["Normal"] },
{ name:"skarmory", iv:95, types:["Steel","Flying"] },
{ name:"throh", iv:91, types:["Fighting"] },
{ name:"wigglytuff", iv:93, types:["Normal","Fairy"] },

{ name:"pidgey", iv:92, types:["Normal","Flying"] },

{ name:"ekans", iv:91, types:["Poison"] },
{ name:"exeggutor", iv:91, types:["Grass","Psychic"] },
{ name:"ivysaur", iv:91, types:["Grass","Poison"] },
{ name:"makuhita", iv:91, types:["Fighting"] },
{ name:"magcargo", iv:91, types:["Fire","Rock"] }, 
{ name:"persian", iv:91, types:["Normal"] },
{ name:"pikachu", iv:93, types:["Electric"], xmas:true },
{ name:"pumpkaboo", iv:91, types:["Ghost","Grass"] },
{ name:"scizor", iv:91, types:["Bug","Flying"] },
{ name:"sliggoo", iv:91, types:["Dragon"] },
{ name:"shelmet", iv:91, types:["Bug"] },
{ name:"wartortle", iv:91, types:["Water"], xmas:true },
{ name:"yungoos", iv:91, types:["Normal"] },
{ name:"jigglypuff", iv:91, types:["Normal","Fairy"], xmas:true },

{ name:"charcadet", iv:88, types:["Fire"] },
{ name:"durant", iv:88, types:["Bug","Steel"] },
{ name:"golbat", iv:88, types:["Poison","Flying"] },
{ name:"minun", iv:88, types:["Electric"] },
{ name:"charizard", iv:86, types:["Fire"], xmas:true },
{ name:"crocalor", iv:84, types:["Fire"] },
{ name:"elgyem", iv:86, types:["Psychic"] },
{ name:"electrike", iv:86, types:["Electric"] }, 
{ name:"glalie", iv:84, types:["Ice"] },
{ name:"indeedee", iv:86, types:["Psychic","Normal"] },
{ name:"indeedee", iv:93, types:["Psychic","Normal"] },
{ name:"kadabra", iv:86, types:["Psychic"] },
{ name:"kirlia", iv:86, types:["Psychic","Fairy"] },
{ name:"lechonk", iv:86, types:["Normal"] },
{ name:"masquerain", iv:86, types:["Bug","Flying"] },
{ name:"metang", iv:86, types:["Steel","Psychic"] },
{ name:"muk", iv:86, types:["Poison"] },
{ name:"sudowoodo", iv:86, types:["Rock"] },
{ name:"swampert", iv:86, types:["Water","Ground"] },
{ name:"venusaur", iv:86, types:["Grass", "Poison"], xmas:true },

{ name:"beedrill", iv:84, types:["Bug","Poison"] },
{ name:"claydol", iv:84, types:["Ground","Psychic"] },
{ name:"jynx", iv:84, types:["Ice","Psychic"] },

{ name:"beartic", iv:82, types:["Ice"] },
{ name:"bellsprout", iv:82, types:["Grass", "Poison"] },
{ name:"charmeleon", iv:82, types:["Fire"] },
{ name:"dusclops", iv:82, types:["Ghost"] },
{ name:"electabuzz", iv:82, types:["Electric"] },
{ name:"gothorita", iv:82, types:["Psychic"] },
{ name:"grovyle", iv:82, types:["Grass"] },
{ name:"lunatone", iv:82, types:["Rock","Psychic"] },
{ name:"magneton", iv:82, types:["Electric"] },
{ name:"snorlax", iv:82, types:["Normal"] },
{ name:"spheal", iv:82, types:["Ice","Water"] },
{ name:"squirtle", iv:82, types:["Water"], xmas:true },
{ name:"tinkatuff", iv:82, types:["Fairy","Steel"] },

{ name:"krabby", iv:80, types:["Water"], dynamax:true },
{ name:"smoliv", iv:80, types:["Grass","Normal"] },

{ name:"chansey", iv:77, types:["Normal"], dynamax:true },
{ name:"gastly", iv:77, types:["Ghost","Poison"], shiny:true },
{ name:"larvitar", iv:77, types:["Rock","Ground"] },
{ name:"omanyte", iv:77, types:["Rock","Water"], dynamax:true },

{ name:"doublade", iv:75, types:["Steel","Ghost"] },
{ name:"krabby", iv:75, types:["Water"], dynamax:true },

{ name:"ditto", iv:73, types:["Normal"] },

{ name:"pikachu", iv:62, types:["Electric"], xmas:true, shiny:true },
{ name:"squirtle", iv:66, types:["Water"], xmas:true, shiny:true },
{ name:"pikachu", iv:86, types:["Electric"], xmas:true },
{ name:"jigglypuff", iv:91, types:["Normal","Fairy"], xmas:true },

{ name:"blastoise", iv:91, types:["Water"], xmas:true },
{ name:"wartortle", iv:91, types:["Water"], xmas:true },
{ name:"wartortle", iv:93, types:["Water"], xmas:true },
{ name:"charmeleon", iv:88, types:["Fire"], xmas:true },
{ name:"charizard", iv:86, types:["Fire"], xmas:true },
{ name:"venusaur", iv:86, types:["Grass", "Poison"], xmas:true }
];

const HOURS_LEADING_SINCE = new Date(2025, 11, 28, 12, 0, 0); // 28/12/2025 12:00 (mês 11 = dezembro)

export const GYM_STATS = {
  gymsDefeated: 177, // quantos ginásios você já derrotou
  get hoursLeading(){
    const ms = Date.now() - HOURS_LEADING_SINCE.getTime();
    return Math.max(0, Math.floor(ms / 36e5)); // horas inteiras desde o horário acima
  }
};


export const META = {
  lastUpdated: "2026-01-02" // YYYY-MM-DD (ou a data que você quiser)
};
