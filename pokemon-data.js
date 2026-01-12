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

{ name:"silcoon", iv:91, types:["Bug"] },
{ name:"meditite", iv:93, types:["Fighting","Psychic"] },
{ name:"wurmple", iv:93, types:["Bug"] },
    { name:"ditto", iv:64, types:["Normal"], shiny:true },

{ name:"pansage", iv:91, types:["Grass"] },
{ name:"chimecho", iv:91, types:["Psychic"] },

{ name:"eevee", iv:0, types:["Normal"] },

{ name:"castform", iv:97, types:["Normal"] },

{ name:"ponyta", iv:35, types:["Fire"], shiny:true },

{ name:"seel", iv:95, types:["Water","Ice"] }, 
    { name:"girafarig", iv:93, types:["Normal","Psychic"] },
    { name:"hitmontop", iv:97, types:["Fighting"] },
{ name:"pansear", iv:91, types:["Fire"] },
{ name:"numel", iv:93, types:["Fire","Ground"] },
    
{ name:"solrock", iv:93, types:["Rock","Psychic"] },
{ name:"lombre", iv:93, types:["Water","Grass"] },
{ name:"piplup", iv:91, types:["Water"] },
{ name:"staryu", iv:100, types:["Water"] },

{ name:"vibrava", iv:97, types:["Ground","Dragon"] },
{ name:"corphish", iv:97, types:["Water"] },

{ name:"jolteon", iv:95, types:["Electric"] },
{ name:"bayleef", iv:95, types:["Grass"] },
{ name:"panpour", iv:95, types:["Water"] },
{ name:"dratini", iv:95, types:["Dragon"] },
{ name:"tentacruel", iv:95, types:["Water","Poison"] },
{ name:"dustox", iv:95, types:["Bug","Poison"] },

{ name:"eevee", iv:94, types:["Normal"] },

{ name:"sandshrew", iv:93, types:["Ground"] },
{ name:"dolliv", iv:93, types:["Grass","Normal"] },

{ name:"onix", iv:95, types:["Rock","Ground"] },
{ name:"onix", iv:91, types:["Rock","Ground"] },

{ name:"hitmonlee", iv:91, types:["Fighting"] },
{ name:"lunatone", iv:91, types:["Rock","Psychic"] },
{ name:"crawdaunt", iv:91, types:["Water","Dark"] },
{ name:"duskull", iv:91, types:["Ghost"] },

{ name:"leafeon", iv:84, types:["Grass"] },

{ name:"gyarados", iv:62, types:["Water","Flying"] },
{ name:"starmie", iv:60, types:["Water","Psychic"] },
{ name:"cetitan", iv:100, types:["Ice"] },
{ name:"nidorina", iv:100, types:["Poison"] },
{ name:"wigglytuff", iv:100, types:["Normal","Fairy"], xmas:true },
{ name:"stufful", iv:100, types:["Normal","Fighting"] },
{ name:"machamp", iv:100, types:["Fighting"] },
{ name:"cetoddle", iv:97, types:["Ice"] },
{ name:"gulpin", iv:97, types:["Poison"] },
{ name:"noctowl", iv:97, types:["Normal","Flying"] },
{ name:"xatu", iv:97, types:["Psychic","Flying"] },
{ name:"baltoy", iv:97, types:["Ground","Psychic"] },
{ name:"flaaffy", iv:97, types:["Electric"] },
{ name:"electrode", iv:97, types:["Electric"] },
{ name:"pelipper", iv:97, types:["Water","Flying"] },
{ name:"haunter", iv:97, types:["Ghost","Poison"] },
{ name:"swellow", iv:97, types:["Normal","Flying"] },
{ name:"minun", iv:97, types:["Electric"] },
{ name:"drifblim", iv:97, types:["Ghost","Flying"] },
{ name:"wobbuffet", iv:95, types:["Psychic"] },
{ name:"avalugg", iv:95, types:["Ice"] },
{ name:"kadabra", iv:95, types:["Psychic"] },
{ name:"haunter", iv:95, types:["Ghost","Poison"] },
{ name:"charmeleon", iv:95, types:["Fire"], xmas:true },
{ name:"swalot", iv:95, types:["Poison"] },
{ name:"kirlia", iv:95, types:["Psychic","Fairy"] },
{ name:"skarmory", iv:95, types:["Steel","Flying"] },
{ name:"mismagius", iv:95, types:["Ghost"] },
{ name:"whirlipede", iv:95, types:["Bug","Poison"] },
{ name:"koffing", iv:95, types:["Poison"] },
{ name:"typhlosion", iv:95, types:["Fire"] },
{ name:"drowzee", iv:95, types:["Psychic"] },
{ name:"gothorita", iv:95, types:["Psychic"] },
{ name:"hitmonchan", iv:95, types:["Fighting"] },
{ name:"metapod", iv:95, types:["Bug"] },
{ name:"snorlax", iv:95, types:["Normal"] },
{ name:"electabuzz", iv:95, types:["Electric"] },
{ name:"arbok", iv:93, types:["Poison"] },
{ name:"arcanine", iv:93, types:["Fire"] },
{ name:"wigglytuff", iv:93, types:["Normal","Fairy"] },
{ name:"leafeon", iv:93, types:["Grass"] },
{ name:"parasect", iv:93, types:["Bug","Grass"] },
{ name:"sentret", iv:93, types:["Normal"] },
{ name:"pikachu", iv:93, types:["Electric"], xmas:true },
{ name:"wartortle", iv:93, types:["Water"] },
{ name:"kakuna", iv:93, types:["Bug","Poison"] },
{ name:"dugtrio-alola", iv:93, types:["Ground","Steel"] },
{ name:"indeedee", iv:93, types:["Psychic","Normal"] },
{ name:"nidoran", iv:93, types:["Poison"] },
{ name:"vaporeon", iv:93, types:["Water"] },
{ name:"flareon", iv:93, types:["Fire"] },
{ name:"venomoth", iv:93, types:["Bug","Poison"] },
{ name:"butterfree", iv:93, types:["Bug","Flying"] },
{ name:"espeon", iv:93, types:["Psychic"] },
{ name:"skitty", iv:93, types:["Normal"] },
{ name:"heracross", iv:93, types:["Bug","Fighting"] },
{ name:"psyduck", iv:93, types:["Water"] },
{ name:"weepinbell", iv:93, types:["Grass","Poison"] },
{ name:"magneton", iv:93, types:["Electric","Steel"] },
{ name:"lapras", iv:93, types:["Water","Ice"] },
{ name:"toxel", iv:93, types:["Electric","Poison"] },
{ name:"pancham", iv:93, types:["Fighting"] },
{ name:"jynx", iv:93, types:["Ice","Psychic"] },
{ name:"wooper", iv:93, types:["Water","Ground"] },
{ name:"mightyena", iv:93, types:["Dark"] },
{ name:"lunatone", iv:93, types:["Rock","Psychic"] },
{ name:"gulpin", iv:93, types:["Poison"] },
{ name:"mienfoo", iv:93, types:["Fighting"] },
{ name:"gastly", iv:93, types:["Ghost","Poison"] },
{ name:"vanillite", iv:93, types:["Ice"] },
{ name:"voltorb", iv:93, types:["Electric"] },
{ name:"gloom", iv:93, types:["Grass","Poison"] },
{ name:"poliwag", iv:93, types:["Water"] },
{ name:"roggenrola", iv:93, types:["Rock"] },
{ name:"nidoran", iv:93, types:["Poison"] },
{ name:"pumpkaboo", iv:91, types:["Ghost","Grass"] },
{ name:"lunatone", iv:91, types:["Rock","Psychic"] },
{ name:"yungoos", iv:91, types:["Normal"] },
{ name:"sandslash-alola", iv:91, types:["Ice","Steel"] },
{ name:"exeggutor", iv:91, types:["Grass","Psychic"] },
{ name:"hariyama", iv:91, types:["Fighting"] },
{ name:"jigglypuff", iv:91, types:["Normal","Fairy"], xmas:true },
{ name:"blastoise", iv:91, types:["Water"] },
{ name:"persian", iv:91, types:["Normal"] },
{ name:"sliggoo", iv:91, types:["Dragon"] },
{ name:"wartortle", iv:91, types:["Water"] },
{ name:"shelmet", iv:91, types:["Bug"] },
{ name:"throh", iv:91, types:["Fighting"] },
{ name:"ivysaur", iv:91, types:["Grass","Poison"], xmas:true },
{ name:"vaporeon", iv:91, types:["Water"] },
{ name:"munna", iv:91, types:["Psychic"] },
{ name:"ledian", iv:91, types:["Bug","Flying"] },
{ name:"graveler", iv:91, types:["Rock","Ground"] },
{ name:"eevee", iv:91, types:["Normal"] },
{ name:"spoink", iv:91, types:["Psychic"] },
{ name:"dusclops", iv:91, types:["Ghost"] },
{ name:"ponyta-galar", iv:91, types:["Psychic"] },
{ name:"marill", iv:91, types:["Water","Fairy"] },
{ name:"growlithe", iv:91, types:["Fire"] },
{ name:"duskull", iv:91, types:["Ghost"] },
{ name:"nosepass", iv:91, types:["Rock"] },
{ name:"misdreavus", iv:91, types:["Ghost"] },
    
{ name:"charcadet", iv:88, types:["Fire"] },
{ name:"minun", iv:88, types:["Electric"] },
{ name:"lechonk", iv:86, types:["Normal"] },
{ name:"kadabra", iv:86, types:["Psychic"], dynamax:true },
{ name:"ralts", iv:86, types:["Psychic","Fairy"], dynamax:true },
{ name:"swampert", iv:86, types:["Water","Ground"] },
{ name:"charizard", iv:86, types:["Fire","Flying"], xmas:true },
{ name:"venusaur", iv:86, types:["Grass","Poison"], xmas:true },
{ name:"crocalor", iv:84, types:["Fire"] },
{ name:"granbull", iv:82, types:["Fairy"] },
{ name:"lapras", iv:82, types:["Water","Ice"] },
{ name:"spheal", iv:82, types:["Ice","Water"], dynamax:true },
{ name:"zygarde", iv:82, types:["Dragon","Ground"] },
{ name:"krabby", iv:80, types:["Water"], dynamax:true },
    
{ name:"chansey", iv:77, types:["Normal"], dynamax:true },
{ name:"omanyte", iv:77, types:["Rock","Water"], dynamax:true },
{ name:"doublade", iv:75, types:["Steel","Ghost"] },
{ name:"krabby", iv:75, types:["Water"], dynamax:true }
];

const HOURS_LEADING_SINCE = new Date(2025, 11, 28, 12, 0, 0); // 28/12/2025 12:00 (mês 11 = dezembro)

export const GYM_STATS = {
  gymsDefeated: 343, // quantos ginásios você já derrotou
  get hoursLeading(){
    const ms = Date.now() - HOURS_LEADING_SINCE.getTime();
    return Math.max(0, Math.floor(ms / 36e5)); // horas inteiras desde o horário acima
  }
};


export const META = {
  lastUpdated: "2026-01-11" // YYYY-MM-DD (ou a data que você quiser)
};
