


// ============================
// Game actions and inputs
// ============================

    const $fade                 = $(".fade"); 
    const $youDied              = $("#you-died");
    const $youWin               = $("#you-win");
    const $rooftopCall          = $("#rooftop-call");
    const $healOptions          = $("#heal-options");
    const $survivorEvents       = $("#survivor-events");
    const $infectedEvents       = $("#infected-events");
    const $playerH1             = $("#player-h1");
    const $infectedH1           = $("#infected-h1");
    const $playerPhoto          = $("<img>").addClass("player-photo");
    const $infectedPhoto        = $("<img>").addClass("infected-photo");
    const $healthPercent        = $("#health-percent");
    const $playerGun            = $("#player-gun");
    const $gunDamage            = $("#gun-damage");

const onStartUp = () => {
    $(() => {
        $playerPhoto.attr({"src": thePlayer().photo, "alt": "Image of " + thePlayer().name});
        $fade.fadeIn(800);
        $rooftopCall.fadeIn(900);
        $playerPhoto.appendTo(".player"); // Loads player image
        $playerH1.text(thePlayer().name); // Loads player name
        $healthPercent.text(`${thePlayer().health}%`);
        $playerGun.text(thePlayer().weapons.weapon);
        $gunDamage.text(`${thePlayer().weapons.firepower} damage`);
        startTheGame();
    });

}


const startTheGame = () => {
    $( () => {

        $("#start-events").on("click", () => {
            $($fade).fadeOut(800);
            $rooftopCall.fadeOut(900);
            activeInfected().spawnInGame(thePlayer());
        });
    });
}

const youDied = () => {
    $fade.fadeIn(800);
    $youDied.fadeIn(900);
    setTimeout(() => {
        location.reload(true);
    }, 2000);
}

const youWin = () => {
    $fade.fadeIn(800);
    $youWin.fadeIn(800);
}

const whatToDo = () => { // Lets player decide what to do
    $survivorEvents.append("<p>What do you want to do?", "attack, heal, restart game, or quit game</p>");

}

$(() => {
    $("#shoot").on("click", () => {
        thePlayer().chanceOfHit(activeInfected());
    });
    $("#heal-self").on("click", () => {
        $fade.fadeIn(800);
        $healOptions.fadeIn(900);
        $(".cancel").on("click", () => {
            $fade.fadeOut(800);
            $healOptions.fadeOut(900);
        });
        $(".medpack").on("click", () => {
            // alert("Medpack Clicked");
            thePlayer().healSelf("pack");
            $fade.fadeOut(800);
            $healOptions.fadeOut(900);
        });

        $(".pills").on("click", () => {
            thePlayer().healSelf("bottle");
            $fade.fadeOut(800);
            $healOptions.fadeOut(900);
        }); 
    }); 
    $("#quit-game").on("click", () => {
        window.location = "index.php";
    });

    $("#restart").on("click", () => {
        location.reload(true);
    });
});



// ============================
// randomMoves: Random / variable functions for dynamic attacks
// ============================

// ============================
// numbers: used to get random numbers
// ============================
const randomMoves = {
    numbers: (num, num2) => {
        return Math.floor(Math.random() * (num + num2));
    },
// ============================
// shuffle: scrambles elements in an array
// ============================
    shuffle: (array) => {
        let arr = array;
    
        for(let i = arr.length - 1; i > 0; i--) {
            let randomIndex = Math.floor(Math.random() * (i + 1));
            let itemAtIndex = arr[randomIndex];
    
            arr[randomIndex] = arr[i];
            arr[i] = itemAtIndex;
        } return arr;
    },
// ============================
// shuffleValues: randomly chooses keys & values in an object
// ============================
    shuffleValues: (values) => {
        const list = values;
        const value = Object.entries(list);
        const randomIndex = Math.floor(Math.random() * (value.length - 1));
        const item = value[randomIndex];
        return item;
    }
}

 // ============================
 // Infected attacks, type, and how much damage done
  // ============================
const infectedAttacks   = {  
    theTank: { punch: 30, throw: 35, hitChance: randomMoves.numbers(4,9) },
    theWitch: { scratch: 33, hitChance: randomMoves.numbers(9, 10) },
    theSmoker: { hit: 15, ensnare: 20, hitChance: randomMoves.numbers(3, 6) },
    theHunter: { scratch: 10, pounce: 25, hitChance: randomMoves.numbers(3, 6) },
    theHorde: { infectedAttacks: randomMoves.numbers(10, 75), hitChance: randomMoves.numbers(1, 9) }
 };

 // ============================
 // Player Items & weapons
// ============================

// ============================
// playerWeapons:  // List of player weapons and stats
// Weapon name, how strong weapon is, how accurate /likely it is to hit
// ============================
 const playerWeapons = [ 
    { weapon: "M16 Assault Rifle", firepower: 135, accuracy: 7.5 },
    { weapon: "Pump Shotgun", firepower: 250, accuracy: 1.5 },
    { weapon: "Hunting Rifle", firepower: 150, accuracy: 8  },
    { weapon: "Pistol", firepower: 76, accuracy: 6.5  }
];

// ============================
// healthPacks: Health items survivor carries to heal self
// ============================
const healthPacks = [ 
    { largePack: { // Item 1: Large health pack, heals 80%
        isItOwned: true, // Does player have one
        healthRegen: 80 // How much it heals
        } 
    },
    { pills: { // Item 2: Bottle of pills, heals 25%
        isItOwned: true,
        healthRegen: 25
        }
    }
];



// ============================
 // Survivor Class
 // Creates profiles all survivors will use & methods that will be actions
// ============================
class Survivor { // Profile creation for survivors
    constructor(name, health = 100, items, weapons, photo, audio) {
        this.name        = name // name
        this.health      = health  // health
        this.items       = items // player's items
        this.weapons     = weapons // player's current weapon
        this.photo       = photo // character photo
        this.audio       = audio // character lines, optional
    }

// ============================
// chanceOfHit: Chances survivor's attack hits or misses
// ============================
    chanceOfHit(infected) { 
        const weaponHits    = this.weapons.accuracy;

        if(weaponHits > randomMoves.numbers(1, 3)) {
            // console.log("Survivors attack has landed!!");
                $infectedPhoto.effect("shake");
                $survivorEvents.empty();
                $infectedEvents.html(`<p>${infected.name} has been hit!</p>`);
                this.fireWeapon(infected);
        } else {
            $survivorEvents.empty();
            $survivorEvents.html("<p>You've missed your shot!</p>");
            infected.chanceOfAttack(this);
        }

    }

// ============================
// damageSurvivor: If survivor is hit, this removes health according to attack's damage
// ============================
    damageSurvivor(infected, infectedDamage)  {
        this.health -= infectedDamage;

        if(this.health <= 75 && this.health > 30)  {
            $("#player-health").removeClass("at-100-percent").addClass("at-50-percent");
        } else if(this.health <= 30) {
            $("#player-health").removeClass("at-50-percent").addClass("at-15-percent");
        } 

        $healthPercent.empty();
        $healthPercent.text(`${thePlayer().health}%`);

        if(this.health > 0) { // If survivor survives, run what to do prompt
            whatToDo();

        } else if(this.health <= 0) { // Ask to restart when dying
            youDied();
        }
    }

    // ============================
    // healSelf: Function to heal yourself when injured, can only heal ocne with pills & medpack
    // ============================
     healSelf(items) { 
        let medPack = this.items[0].largePack.healthRegen; // health pack
        let medPackOwned = this.items[0].largePack.isItOwned; // true or false if you have a health pack
        let pills = this.items[1].pills.healthRegen; // pills
        let pillsOwned = this.items[1].pills.isItOwned; // true or false if you have pills

        if(this.health === 100 || items === "false") {
            if(items === "pack") {
                $(".medpack").effect("shake");
            } else if(items === "bottle") {
                $(".pills").effect("shake");
                return;
            }
        } 

        if(items === "pack") { // For Medpack
            if(this.health < 100) {
                this.health += medPack;
                this.items[0].largePack.isItOwned = "false";
                if(this.health > 100) {
                    this.health = 100;
                }
            } 
        } 
        else if(items === "bottle") {// For pills
            if(this.health < 100 ) {
                this.health += pills;
                this.items[1].pills.isItOwned = "false";
                if(this.health > 100) {
                    this.health = 100;
                }
            }
        } 
        $healthPercent.empty();
        $healthPercent.text(`${thePlayer().health}%`);

        if(thePlayer().health > 30 && thePlayer().health <= 75) {
            $("#player-health").removeClass("at-15-percent").addClass("at-50-percent");
        }  else if(this.health > 75) {
            $("#player-health").removeClass("at-15-percent").removeClass("at-50-percent").addClass("at-100-percent");
        } 
        
        setTimeout(() => { // launches infected's attack attempt on survivor once healing is done
            activeInfected().chanceOfAttack(this);
        }, 2000); 
    }

// ============================
// fireWeapon: if you hit infected this while say so and launch the function to damage infected according to firepower level
// ============================
    fireWeapon(infected) {
        let weapon          = this.weapons.weapon; // current weapon
        let weaponDamage    = this.weapons.firepower; //curent weapon's damage
        console.log(`${this.name} has shot at ${infected.name} with the ${weapon} with ${weaponDamage} damage`);
        infected.takeDamage(this);
    }
}

// ============================
// Infected Class
// Creates class for all infected as well as methods infected will use
// ----------------------
// IncreaseHorde Class
// Takes the horde profile and makes 3 more dupelicates for event purposes!
// ============================
class Infected { // Profile creation for infected
    constructor(name, health, photo, attack, audio) {
        this.name      = name // infected's name
        this.health    = health // infected's health
        this.photo     = photo // infected photo
        this.attack    = attack // infected attacks
        this.audio     = audio // infected sounds and music, optional
    }
// ============================
// chanceOfAttack: Decides if an infected's attack hits or misses
// ============================
    chanceOfAttack(survivor)  { // Param 'survivor' passes survivor profile
        let infectedHits        = this.attack.hitChance;
        if(infectedHits > 3 ) {
            $infectedEvents.empty();
            this.attackHumans(survivor);
            $infectedEvents.html(`<p>The ${this.name} has successfully attacked ${survivor.name}!</p>`);
            $playerPhoto.delay(800).effect("shake");

        } else {
            $infectedEvents.empty();
            $infectedEvents.html("<p>Infected hit has missed!</p>");
            whatToDo();
        }
    }

// ============================
// infectedHit: Decides randomy which attack special infected will use
// ============================
    infectedHit() {
        let attack = randomMoves.shuffleValues(this.attack);
        return attack;
    }

    // ============================
    // attackHumans: If infected attack hits, damage is taken to survivor depending on type of infected and type of attack
    // ============================
    attackHumans(survivor) {
        let survivorHealth      = survivor.health; // survivor's health
        var dynamicAttack = this.infectedHit(); // current infect's attack 

        // console.log(`${survivor.name} is at ${survivorHealth} health`);
        $infectedEvents.html(`<p>The ${this.name} has attacked with ${dynamicAttack[0]}!</p>`);
        survivor.damageSurvivor(this, dynamicAttack[1]);
    }

    // ============================
    // takeDamage: // Infected takes damage from survivor's attack
    // ============================
    takeDamage(survivor) { 
        this.health -= survivor.weapons.firepower;
        let infectedsHealth = this.health;
        if(infectedsHealth > 0 ) { // If infected's health is over 0
            $infectedEvents.empty();
            $infectedEvents.html(`<p>${this.name} has survived the attack!</p>`);
            this.chanceOfAttack(survivor);

        } else if(infectedsHealth <= 0) { // If infect's health is at or below 0, kill it

            if(allInfectedListed.length > 0) { // If there's still infected to fight, remove newly killed infected from array
                allInfectedListed.shift();
                $infectedEvents.empty();
                $infectedEvents.html(`<p>${this.name} has been killed!</p>`);
                $infectedH1.empty();
                $infectedPhoto.fadeOut();

                setTimeout(() => {
                    $infectedPhoto.remove();
                    this.spawnInGame(thePlayer());
                }, 1000);

            } else { // If there are no more infected to kill, you've won  the game!
                youWin();
            }
        }
    }

    // ============================
    // spawnInGame: // 'Spawns' the infected to attack, the first move & event of the game
    // ============================
    spawnInGame(survivor)  { // 'Spawns' the infected to attack
        if(allInfectedListed.length > 0) {
            $infectedH1.text(activeInfected().name);
            $infectedEvents.html(`<p>${activeInfected().name} has spawned!</p>`);
            $infectedPhoto.hide().delay("slow").fadeIn().attr("src", activeInfected().photo);
            $infectedPhoto.appendTo(".infected");
            whatToDo();
        } else {
            youWin();
        }
    }
}

// ============================
// IncreaseHorde: class that takes in original horde profile and duplicates it
// ============================
class IncreaseHorde { // Creates and groups all infected for game
    constructor(theInfected) {
        this.infected       = theInfected // Grabs the common infected to create horde
        this.hordeWaves     = [] // Where horde waves will live in array 
    }

    // ============================
    // spawnHordes:  duplicates the horde 3 times so there's 4 total
    // ============================
    spawnHordes() { // creates 4 total waves of the horde to be fought
        let multiplydHorde = this.infected;
        for(let i = 1; i <= 4; i++) {
            this.hordeWaves.push(multiplydHorde);
        } return this.hordeWaves;
    }
}

// ============================
// Player and infected profiles
// ============================

const zoey = new Survivor ( // Zoey survivor profile
    "Zoey", 
    100,
    healthPacks,
    playerWeapons[randomMoves.numbers(0, 4)],
    "images/survivors/zoey/zoey_3.jpg"
);

const bill = new Survivor ( // Zoey survivor profile
    "Bill", 
    100,
    healthPacks,
    playerWeapons[randomMoves.numbers(0, 4)],
    "images/survivors/bill/bill4.jpg"
);

const louis = new Survivor ( // Zoey survivor profile
    "Louis", 
    100,
    healthPacks,
    playerWeapons[randomMoves.numbers(0, 4)],
    "images/survivors/louis/louis_3.jpg"
);

const francis = new Survivor ( // Zoey survivor profile
    "francis", 
    100,
    healthPacks,
    playerWeapons[randomMoves.numbers(0, 4)],
    "images/survivors/francis/francis_2.jpg"
);

const tank = new Infected ( // Tank profile
    "The Tank",
    600,
    "images/infected/tank/tank_4.png",
    infectedAttacks.theTank
);

const witch = new Infected ( // Witch profile
    "The Witch",
    400,
    "images/infected/witch/witch.png",
    infectedAttacks.theWitch
);

const hunter = new Infected ( // Hunter profile
    "The Hunter",
    250,
    "images/infected/hunter/hunter_4.png",
    infectedAttacks.theHunter
);

const smoker = new Infected ( // Smoker profile
    "The Smoker",
    250,
    "images/infected/smoker/smoker_2.gif",
    infectedAttacks.theSmoker
);

const commonInfected = new Infected ( // Common infected / the horde profile
    "The Horde",
    randomMoves.numbers(100, 400),
    "images/infected/horde/horde_5.png",
    infectedAttacks.theHorde
    );



    // ============================
    // Creates horde clones, special infected array is created, then all merged into one infected array to be fought against
    // Also creates survivors list array and scrambles.
    // ============================

    const theHorde              = new IncreaseHorde(commonInfected); // pushes common infected for multiplication purposes
    const allHordes             = theHorde.spawnHordes(); // creates array of 4 total hordes
    const allSpecialInfected    = [ tank, witch, hunter, smoker ] // array of special infected
    const allInfectedListed     = randomMoves.shuffle([...allHordes, ...allSpecialInfected]); // Merges both horde and special infected into 1 array and randomly shuffles them to make game events random every time variable is called.
    const activeInfected        = () => { // current infected attacking
        return allInfectedListed[0];
    } 
    const allSurvivorsListed    = randomMoves.shuffle([zoey, francis, bill, louis]);
    const thePlayer             = () => {
        return allSurvivorsListed[0];
    }

onStartUp();
