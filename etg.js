var rng = new MersenneTwister(0);
var Other = 0;
var Entropy = 1;
var Death = 2;
var Gravity = 3;
var Earth = 4;
var Life = 5;
var Fire = 6;
var Water = 7;
var Light = 8;
var Air = 9;
var Time = 10;
var Darkness = 11;
var Aether = 12;
var PillarEnum = 0;
var WeaponEnum = 1;
var ShieldEnum = 2;
var PermanentEnum = 3;
var SpellEnum = 4;
var CreatureEnum = 5;
var TrueMarks = ["8pi", "8pj", "8pk", "8pl", "8pm", "8pn", "8po", "8pp", "8pq", "8pr", "8ps", "8pt", "8pu"];
var NymphList = [undefined, undefined,
	"500", "6ug",
	"534", "71k",
	"568", "74o",
	"59c", "77s",
	"5cg", "7b0",
	"5fk", "7e4",
	"5io", "7h8",
	"5ls", "7kc",
	"5p0", "7ng",
	"5s4", "7qk",
	"5v8", "7to",
	"62c", "80s"];
var ShardList = [undefined, undefined,
	"50a", "6uq",
	"53e", "71u",
	"56i", "752",
	"59m", "786",
	"5cq", "7ba",
	"5fu", "7ee",
	"5j2", "7hi",
	"5m6", "7km",
	"5pa", "7nq",
	"5se", "7qu",
	"5vi", "7u2",
	"62m", "816"];
var RandomCardSkip = ["4t8", "6ro", "4vr", "6ub", "597", "77n", "5fd", "7dt", "Ash"];
function loadcards(cb){
	var Cards = {};
	var Targeting = {};
	var names = ["pillar", "weapon", "shield", "permanent", "spell", "creature"];
	var count = 0;
	function maybeCallback(){
		if (++count == names.length+1)cb(Cards, Targeting);
	}
	for(var i=0; i<names.length; i++){
		var xhr = new XMLHttpRequest();
		xhr.open("GET", names[i] + ".csv", true);
		(function(_i){
			xhr.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200){
					var csv = this.responseText.split("\n");
					var keys = csv[0].split(",");
					for(var j=1; j<csv.length; j++){
						var carddata = csv[j].split(",");
						var cardcode = carddata[2];
						var cardinfo = {};
						for(var k=0; k<carddata.length; k++)cardinfo[keys[k]] = carddata[k];
						var nospacename = carddata[1].replace(/ /g,"");
						Cards[nospacename in Cards?nospacename+"Up":nospacename] = Cards[cardcode] = new Card(_i, cardinfo);
					}
					maybeCallback();
				}
			}
		})(i);
		xhr.send();
	}
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "active.csv", true);
	xhr.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200){
			var csv = this.responseText.split("\n");
			for (var i=0; i<csv.length; i++){
				var keypair = csv[i].split(",");
				Targeting[Actives[keypair[0]]] = TargetFilters[keypair[1]];
			}
			maybeCallback();
		}
	}
	xhr.send();
}
function shuffle(array) {
	var counter = array.length, temp, index;
	while (counter--) {
		index = (rng.real() * counter) | 0;
		temp = array[counter];
		array[counter] = array[index];
		array[index] = temp;
	}
	return array;
}
function place(array, item){
	for (var i=0; i<array.length; i++){
		if (!array[i]){
			return array[i] = item;
		}
	}
}
Card.prototype.readCost = function(attr, cost, e){
	if (~cost.indexOf("+")){
		var c=cost.split("+");
		this[attr]=parseInt(c[0]);
		this[attr+"ele"]=parseInt(c[1]);
	}else{
		this[attr]=parseInt(cost);
		this[attr+"ele"]=e;
	}
}
Card.prototype.info = function(){
	var typeString = ["Pillar", "Shield", "Weapon", "Permanent", "Spell", "Creature"];
	var info = typeString[this.type] + " " + this.cost+":"+this.costele;
	if (this.attack && this.health)info += " " + this.attack+"|"+this.health;
	else if (this.type == ShieldEnum)info += " " + this.health + "dr";
	if (this.active)info += " " + casttext(this.cast, this.castele) + " " + activename(this.active);
	if (this.passives && this.passives.length)info += " " + this.passives.join(" ");
	return info;
}
Card.prototype.asUpped = function(upped){
	return this.upped == upped ? this : Cards[(this.upped?parseInt(this.code, 32)-2000:parseInt(this.code, 32)+2000).toString(32)];
}
Player.prototype.isCloaked = function(){
	for(var i=0; i<16; i++){
		if (this.permanents[i] && this.permanents[i].cloak){
			return true;
		}
	}
	return false;
}
Player.prototype.info = function(){
	var info = this.hp + "/" + this.maxhp + " " + this.deck.length + "cards";
	if (this.nova)info += " " + this.nova + "nova";
	if (this.poison)info += " " + this.poison + "psn";
	if (this.neuro)info += " neuro";
	if (this.sosa)info += " " + this.sosa + "sosa";
	if (this.silence)info += " silence";
	if (this.sanctuary)info += " sanctuary";
	if (this.precognition)info += " precognition";
	if (this.gpull)info += " gpull";
	return info;
}
Player.prototype.randomquanta = function() {
	var nonzero = 0
	for(var i=1; i<13; i++){
		nonzero += this.quanta[i];
	}
	if (nonzero == 0){
		return -1;
	}
	nonzero = Math.ceil(rng.real()*nonzero);
	for(var i=1; i<13; i++){
		if ((nonzero -= this.quanta[i])<=0){
			return i;
		}
	}
}
Player.prototype.canspend = function(qtype, x) {
	if (x <= 0)return true;
	if (qtype == Other){
		for (var i=1; i<13; i++){
			x -= this.quanta[i];
			if (x <= 0){
				return true;
			}
		}
		return false;
	}else return this.quanta[qtype] >= x;
}
Player.prototype.spend = function(qtype, x) {
	if (x == 0)return true;
	if (!this.canspend(qtype, x))return false;
	if (qtype == Other){
		var b = x<0?-1:1;
		for (var i=x*b; i>0; i--){
			this.quanta[b==-1?Math.ceil(rng.real()*12):this.randomquanta()] -= b
		}
	}else this.quanta[qtype] -= x;
	for (var i=1; i<13; i++){
		if (this.quanta[i]>75){
			this.quanta[i]=75;
		}
	}
	return true;
}
Player.prototype.endturn = function(discard) {
	if (discard != undefined){
		var card=this.hand[discard];
		if (card.passives && ~card.passives.indexOf("obsession")){
			this.dmg(card.upped?13:10);
		}
		this.hand.splice(discard, 1);
	}
	this.precognition = this.sanctuary = this.silence = false;
	this.spend(this.mark, -1);
	this.foe.dmg(this.foe.poison);
	var patienceFlag = false, floodingFlag = false, stasisFlag = false, floodingPaidFlag = false, freedomChance = 0;
	for(var i=0; i<16; i++){
		var p;
		if ((p=this.permanents[i])){
			if (p instanceof Pillar || p.cast == -1){
				p.active();
			}
			p.usedactive = false;
			if (p.cloak || p.stasis){
				if (--p.charges < 0){
					delete this.permanents[i];
				}else if (p.stasis){
					stasisFlag = true;
				}
			}else if (p.flooding && !floodingPaidFlag){
				floodingPaidFlag = true;
				floodingFlag = true;
				if (!this.spend(Water, 1)){
					delete this.permanents[i];
				}
			}else if (p.sopa){
				patienceFlag = true;
			}else if (p.freedom){
				freedomChance += .25;
			}
		}
		if ((p=this.foe.permanents[i])){
			if (p.stasis){
				if (--p.charges < 0){
					delete this.foe.permanents[i];
				}else stasisFlag = true;
			}else if (p.flooding){
				floodingFlag = true;
			}
		}
	}
	var cr;
	for (var i=0; i<23; i++){
		if ((cr = this.creatures[i])){
			if (patienceFlag){
				var floodbuff = floodingFlag && i>5 && c.card.element==Water;
				cr.atk += floodbuff?5:cr.burrowed?4:2;
				cr.buffhp(floodbuff?5:2);
				cr.delay(1);
			}
			cr.attack(stasisFlag, freedomChance);
			if (cr.adrenaline>0){
				cr.adrenaline=1;
			}
			if (i>5 && floodingFlag && (cr.card.element != Water || cr.card.element != Other) && ~cr.getIndex()){
				cr.die();
			}
		}
		if ((cr = this.foe.creatures[i]) && cr.salvaged){
			cr.salvaged = undefined;
		}
	}
	if (this.shield){
		if (this.shield.active == Actives.evade100 || this.shield.active == Actives.wings){
			if (--this.shield.charges < 0){
				this.shield = undefined;
			}
		}
		else if (this.shield.hope){
			var dr = this.shield.card.upped?1:0;
			for (var i=0; i<23; i++){
				if (this.creatures[i] && this.creatures[i].active == Actives.light)
					dr++;
			}
			this.shield.dr = dr;
		}
	}
	if (this.weapon)this.weapon.attack();
	if (this.sosa > 0){
		this.sosa--;
	}
	this.nova = 0;
	this.foe.drawcard();
}
Player.prototype.drawcard = function() {
	if (this.hand.length<8){
		if (this.deck.length>0){
			this.hand[this.hand.length] = this.deck.pop();
		}else if (!winner){
			setWinner(this.foe);
		}
	}
}
Player.prototype.drawhand = function() {
	shuffle(this.deck);
	var mulligan = true;
	for(var i=0; i<7; i++){
		if (this.deck[i].cost == 0){
			mulligan=false;
			break;
		}
	}
	if (mulligan){
		shuffle(this.deck);
	}
	for(var i=0; i<7; i++){
		this.hand.push(this.deck.pop());
	}
}
Player.prototype.masscc = function(caster, func){
	for(var i=0; i<16; i++){
		if (this.permanents[i] && this.permanents[i].cloak){
			Actives.destroy.call(this, this.permanents[i]);
		}
	}
	for(var i=0; i<23; i++){
		if (this.creatures[i] && !this.creatures[i].immaterial && !this.creatures[i].burrowed){
			func.call(caster, this.creatures[i]);
		}
	}
}
Creature.prototype.info = function(){
	var info=this.trueatk()+"|"+this.truehp()+"/"+this.maxhp;
	if (this.active)info+=" "+casttext(this.cast, this.castele)+" "+activename(this.active);
	if (this.frozen)info+=" "+this.frozen+"frozen";
	if (this.delayed)info+=" "+this.delayed+"delay";
	if (this.poison)info+=" "+this.poison+"psn";
	if (this.owner.gpull == this)info += " gpull";
	if (this.adrenaline)info += " adrenaline";
	for (var key in this){
		if (this[key] === true)info += " " + key;
	}
	return info;
}
Permanent.prototype.info = function(){
	var info = this.charges?"x"+this.charges:"";
	if (this.active)info+=" "+casttext(this.cast, this.castele)+" "+activename(this.active);
	for (var key in this){
		if (this[key] === true)info += " " + key;
	}
	return info;
}
Weapon.prototype.info = function(){
	var info = this.trueatk().toString();
	if (this.active)info+=" "+casttext(this.cast, this.castele)+" "+activename(this.active);
	if (this.frozen)info += " "+this.frozen+"frozen";
	if (this.delayed)info += " "+this.delayed+"delay";
	for (var key in this){
		if (this[key] === true)info += " " + key;
	}
	return info;
}
Shield.prototype.info = function(){
	var info = this.dr + "DR";
	if (this.active)info+=" "+activename(this.active);
	if (this.charges)info += " x"+this.charges;
	for (var key in this){
		if (this[key] === true)info += " " + key;
	}
	return info;
}
Pillar.prototype.info = function(){
	return this.charges + " " + (this.pendstate?this.owner.mark:this.card.element) + (this.immaterial?" immaterial":"");
}
Pillar.prototype.stackable = true;
Player.prototype.delay = function(x) {
	if (this.weapon)this.weapon.delay(x);
}
Player.prototype.freeze = function(x) {
	if (this.weapon)this.weapon.freeze(x);
}
Weapon.prototype.addpoison = function(x) {
	return this.owner.addpoison(x);
}
Weapon.prototype.spelldmg = function(x) {
	return this.owner.spelldmg(x);
}
Weapon.prototype.dmg = function(x) {
	return this.owner.dmg(x);
}
Player.prototype.dmg = function(x, ignoresosa) {
	var sosa = this.sosa && !ignoresosa;
	if (sosa){
		x *= -1;
	}
	if (x<0){
		var heal = Math.max(this.hp-this.maxhp, x);
		this.hp = Math.min(this.maxhp, this.hp-x);
		return sosa?-x:heal;
	}else{
		this.hp -= x;
		if (this.hp <= 0 && !winner){
			setWinner(this.foe);
		}
		return sosa?-x:x;
	}
}
Player.prototype.spelldmg = function(x) {
	return (!this.shield || this.shield.reflect?this:this.foe).dmg(x);
}
Creature.prototype.getIndex = function() { return this.owner.creatures.indexOf(this); }
Player.prototype.addpoison = Creature.prototype.addpoison = function(x) {
	this.poison += x;
	if (this.voodoo){
		this.owner.foe.poison += x;
	}
}
Player.prototype.buffhp = Creature.prototype.buffhp = function(x){
	this.maxhp += x;
	if (this instanceof Player && this.maxhp>500){
		this.maxhp = 500;
	}
	this.dmg(-x);
}
Weapon.prototype.delay = Creature.prototype.delay = function(x){
	this.delayed += x;
	if (this.voodoo)this.owner.foe.delay(x);
}
Weapon.prototype.freeze = Creature.prototype.freeze = function(x){
	this.frozen = x;
	if (this.voodoo)this.owner.foe.freeze(x);
}
Creature.prototype.spelldmg = Creature.prototype.dmg = function(x, dontdie){
	var dmg = x<0 ? Math.max(this.hp-this.maxhp, x) : Math.min(this.truehp(), x);
	this.hp -= dmg;
	if (this.truehp() <= 0){
		if (!dontdie)this.die();
	}else if (dmg>0 && this.voodoo)this.owner.foe.dmg(x);
	return dmg;
}
Creature.prototype.remove = function(index) {
	index = index || this.getIndex();
	delete this.owner.creatures[index];
	if (this.owner.gpull == this)this.owner.gpull = null;
	return index;
}
Creature.prototype.deatheffect = function() {
	for(var i=0; i<2; i++){
		var pl = players[i];
		for(var j=0; j<23; j++){
			var c = pl.creatures[j];
			if (c && c.active == Actives.scavenger){
				c.atk += 1;
				c.buffhp(1);
			}
		}
		for(var j=0; j<16; j++){
			var p = pl.permanents[j];
			if (p){
				if (p.boneyard && this.card != Cards.Skeleton && this.card != Cards.SkeletonUp){
					place(p.owner.creatures, new Creature(Cards.Skeleton.asUpped(p.card.upped), p.owner));
				}else if (p.soulcatcher){
					pl.spend(Death, p.card.upped?-3:-2);
				}
			}
		}
		if (pl.shield && pl.shield.active == Actives.bones){
			pl.shield.charges += 2
		}
	}
}
Creature.prototype.die = function() {
	var index = this.remove();
	if (this.aflatoxin){
		(this.owner.creatures[index] = new Creature(Cards.MalignantCell, this.owner)).usedactive = false;
	}else if (this.active == Actives.phoenix){
		this.owner.creatures[index] = new Creature(Cards.Ash.asUpped(this.card.upped), this.owner);
	}
	new DeathEffect(creaturePos(this.owner == player1?0:1, index));
	this.deatheffect();
}
Creature.prototype.transform = function(card){
	this.card = card;
	this.maxhp = this.hp = card.health;
	this.atk = card.attack;
	this.active = card.active;
	this.cast = card.cast;
	this.castele = card.castele;
	for(var i=0; i<card.passives.length; i++){
		this[card.passives[i]] = true;
	}
}
Thing.prototype.evade = function(sender) { return false; }
Creature.prototype.evade = function(sender) {
	if (sender != this.owner && this.airborne && this.card.element == Air){
		var freedomChance = 0;
		for(var i=0; i<16; i++){
			if (this.owner.permanents[i] && this.owner.permanents[i].freedom){
				freedomChance += .25;
			}
		}
		return freedomChance && rng.real() < freedomChance;
	}
}
Weapon.prototype.trueatk = Creature.prototype.trueatk = function(adrenaline){
	var dmg = this.atk+this.steamatk+this.dive;
	if (this.active && this.cast == -3)dmg += this.active();
	if (this.burrowed)dmg = Math.ceil(dmg/2);
	if (this instanceof Creature && (this.card.element == Death || this.card.element == Darkness)){
		dmg += calcEclipse();
	}
	var y=adrenaline || this.adrenaline;
	if (y<2)return dmg;
	var attackCoefficient = 4-countAdrenaline(dmg);
	for(var i=1; i<y; i++){
		dmg -= Math.ceil(attackCoefficient*dmg*i/3);
	}
	return dmg;
}
Player.prototype.truehp = function(){ return this.hp; }
Creature.prototype.truehp = function(){
	var hp = this.hp;
	if ((this.card.element == Darkness || this.card.element == Death) && calcEclipse() != 0){
		hp++;
	}
	if (this.swarm){
		for (var i=0; i<23; i++){
			if (this.owner.creatures[i] && this.owner.creatures[i].swarm){
				hp++;
			}
		}
	}
	return hp;
}
Permanent.prototype.getIndex = function() { return this.owner.permanents.indexOf(this); }
Permanent.prototype.die = function(){ delete this.owner.permanents[this.getIndex()]; }
Weapon.prototype.die = function() { this.owner.weapon = undefined; }
Shield.prototype.die = function() { this.owner.shield = undefined; }
Thing.prototype.isMaterialInstance = function(type) {
	return this instanceof type && !this.immaterial && !this.burrowed;
}
Thing.prototype.canactive = function(turn) {
	return (turn || myturn) && this.active && !this.usedactive && this.cast >= 0 && !this.delayed && !this.frozen && this.owner.canspend(this.castele, this.cast);
}
Thing.prototype.useactive = function(t) {
	this.usedactive = true;
	if (!t || !t.evade(this.owner)){
		this.active(t);
	}
	this.owner.spend(this.castele, this.cast);
	if (this.sacrifice){
		this.die();
	}
}
function countAdrenaline(x){
	return 5-Math.floor(Math.sqrt(Math.abs(x)));
}
Weapon.prototype.attack = Creature.prototype.attack = function(stasis, freedomChance){
	var isCreature = this instanceof Creature;
	if (isCreature){
		this.dmg(this.poison, true);
	}
	var target = this.owner.foe;
	if (this.frozen == 0 && this.adrenaline<3){
		if (this.cast == -1 && this.active){
			this.active();
		}
		if (this.devour && target.spend(Other, 1)){
			this.owner.spend(Darkness, -1);
		}else if (this.singularity){
			var r = rng.real();
			if (r > .9){
				this.adrenaline=1;
			}else if (r > .8){
				this.cast = -2;
				this.active = Actives.vampire;
			}else if (r > .7){
				Actives.quint.call(this, this);
			}else if (r > .6){
				Actives.scramble.call(this, this.owner);
			}else if (r > .5){
				Actives.blackhole.call(this.owner.foe);
			}else if (r > .4){
				this.atk -= Math.floor(rng.real()*5);
				this.buffhp(Math.floor(rng.real()*5));
			}else if (r > .3){
				Actives.nova.call(this.owner.foe);
				this.owner.foe.nova = 0;
			}else if (r > .2){
				Actives.parallel.call(this, this);
			}else if (r > .1){
				this.owner.weapon = new Weapon(Cards.Dagger, this.owner);
			}
			this.dmg(this.trueatk(), true);
		}
	}
	var trueatk, momentum = this.momentum;
	if (!(stasis || this.frozen>0 || this.delayed>0) && (trueatk = this.trueatk()) != 0){
		if (this.airborne && freedomChance && rng.real() < freedomChance){
			trueatk = Math.ceil(trueatk * 1.5);
			momentum = true;
		}
		if (this.psion){
			target.spelldmg(trueatk);
		}else if (momentum || trueatk < 0){
			target.dmg(trueatk);
			if (this.adrenaline < 3 && this.active && this.cast == -2){
				this.dmgdone = trueatk;
				this.active(target);
			}
		}else if (isCreature && target.gpull){
			var dmg = target.gpull.dmg(trueatk);
			if (this.adrenaline < 3 && this.active && this.cast == -2){
				this.dmgdone = dmg;
				this.active(target);
			}
		}else if (!target.shield || (trueatk > target.shield.dr && (!target.shield.active || !target.shield.active(this)))){
			var dmg = trueatk - (target.shield?target.shield.dr:0);
			target.dmg(dmg);
			if (this.adrenaline < 3 && this.active && this.cast == -2){
				this.dmgdone = dmg;
				this.active(target);
			}
		}
	}
	if (this.frozen > 0){
		this.frozen--;
	}
	if (this.delayed > 0){
		this.delayed--;
	}
	if (this.steamatk>0){
		this.steamatk--;
	}
	this.usedactive = false;
	this.dive = 0;
	if (this.active == Actives.dshield){
		this.immaterial = false;
	}
	if (~this.getIndex()){
		if (this instanceof Creature && this.truehp() <= 0){
			this.die();
		}else if (this.adrenaline > 0 && this.adrenaline < countAdrenaline(this.trueatk(1))){
			this.adrenaline++;
			this.attack(stasis, freedomChance);
		}
	}
}
Player.prototype.summon = function(index, target){
	var card = this.hand[index];
	this.hand.splice(index, 1);
	if (this.neuro){
		this.poison += 1;
	}
	if (card.type <= PermanentEnum){
		if (card.type == PillarEnum){
			if (card.upped){
				this.spend(card.element, card.element>0?-1:-3);
			}
			for (var i=0; i<16; i++){
				if (this.permanents[i] && this.permanents[i].card == card){
					this.permanents[i].charges += 1;
					return this.permanents[i];
				}
			}
			place(this.permanents, new Pillar(card, this));
		}else if (card.type == WeaponEnum){
			this.weapon = new Weapon(card, this);
		}else if (card.type == ShieldEnum){
			this.shield = new Shield(card, this);
			if (card == Cards.DimensionalShield || card == Cards.PhaseShield){
				this.shield.charges = 3;
			}else if (card == Cards.Wings || card == Cards.WingsUp){
				this.shield.charges = 5;
			}else if (card == Cards.BoneWall || card == Cards.BoneWallUp){
				this.shield.charges = 7;
			}
		}else{
			var p = new Permanent(card, this);
			if (card == Cards.Sundial || card == Cards.SundialUp){
				p.charges = 2;
			}else if(card == Cards.Cloak || card == Cards.CloakUp){
				p.charges = 3;
			}
			place(this.permanents, p);
		}
	}else if (card.type == SpellEnum){
		if (!target || !target.evade(this)){
			this.card = card
			card.active.call(this, target)
		}
	}else if (card.type == CreatureEnum) {
		place(this.creatures, new Creature(card, this));
	}else console.log("Unknown card type: "+card.type);
	this.spend(card.costele, card.cost);
}
function calcEclipse(){
	var bonus = 0;
	for (var j=0; j<2; j++){
		for (var i=0; i<16; i++){
			if (players[j].permanents[i]){
				if (players[j].permanents[i].card == Cards.Nightfall){
					bonus = 1;
				}else if (players[j].permanents[i].card == Cards.Eclipse){
					return 2;
				}
			}
		}
	}
	return bonus;
}
function randomcard(upped, filter){
	var keys = [];
	for(var key in Cards) {
		if (key.length == 3 && Cards[key].upped == upped && !~RandomCardSkip.indexOf(key) && (!filter || filter(Cards[key]))) {
			var intKey = parseInt(key, 32);
			// Skip marks
			if (!((intKey>=5011&&intKey<=5022)||(intKey>=7011&&intKey<=7022))){
				keys.push(key);
			}
		}
	}
	keys.sort();
	return Cards[keys[Math.floor(rng.real() * keys.length)]];
}
function activename(active){
	for(var key in Actives){
		if (Actives[key] == active){
			return key;
		}
	}
}
function casttext(cast, castele){
	if (cast > 0){
		return cast + ":" + castele;
	}else if (cast == 0){
		return "0";
	}else if (cast == -1){
		return "";
	}else if (cast == -2){
		return "onhit";
	}else if (cast == -3){
		return "buff";
	}else console.log("Unknown cost: " + cast);
}
function salvageScan(from, t){
	if (t.owner.hand.length<8 && t.owner != from){
		for (var i=0; i<23; i++){
			if (t.owner.creatures[i] && t.owner.creatures[i].salvage && !t.owner.creatures[i].salvaged){
				t.owner.creatures[i].salvaged = true;
				t.owner.hand.push(t.card);
				return;
			}
		}
	}
}
var TargetFilters = {
	pill:function(c, t){
		return t.isMaterialInstance(Pillar);
	},
	weap:function(c, t){
		return t.card.type == WeaponEnum && !t.immaterial && !t.burrowed;
	},
	perm:function(c, t){
		return t.isMaterialInstance(Permanent);
	},
	crea:function(c, t){
		return t.isMaterialInstance(Creature);
	},
	creaonly:function(c, t){
		return t.isMaterialInstance(Creature) && t.card.type == CreatureEnum;
	},
	creanonspell:function(c, t){
		return t.isMaterialInstance(Creature) && t.card.type != SpellEnum;
	},
	play:function(c, t){
		return t instanceof Player;
	},
	creaorplay:function(c, t){
		return t instanceof Player || t.isMaterialInstance(Creature);
	},
	foeperm:function(c, t){
		return c.owner != t.owner && t.isMaterialInstance(Permanent);
	},
	butterfly:function(c, t){
		return t.isMaterialInstance(Creature) && t.trueatk()<3;
	},
	devour:function(c, t){
		return t.isMaterialInstance(Creature) && t.truehp()<c.truehp();
	},
	paradox:function(c, t){
		return t.isMaterialInstance(Creature) && t.truehp()<t.trueatk();
	},
	airbornecrea:function(c, t){
		return t.isMaterialInstance(Creature) && t.airborne;
	},
	wisdom:function(c, t){
		return t instanceof Creature && !t.burrowed;
	}
}
