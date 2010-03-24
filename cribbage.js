var cribbage = {};

(function(){

     var SPADES = 1;
     var HEARTS = 2;
     var CLUBS = 3;
     var DIAMONDS = 4;

     var JACK = 11;
     var QUEEN = 12;
     var KING = 13;
     var ACE = 1;


     /**
      * Log messages to the screen.
      */
     function log(){
         try{
             console.log.apply(this, arguments);
         } catch (e){
             console.log(arguments);
         }

         var a = [];
         for (var i=0; i<arguments.length; i++){
             a.push(arguments[i]);
         }
         //document.write("<pre>"+a.join(" ")+"</pre>");
     }

     /**
      * Get points for hand
      */
     function getPointsForHand(hand, starter){
         var permutations = permute(hand.concat([starter]));
         var points = 0;
         for (var i=0, ii=permutations.length; i<ii; i++){
             var description = [];
             var permPoints = 0;
             var cards = permutations[i];
             cards.sort(Card.cmp);
             var j = cards.length;
             var sum = 0;
             while (j--){
                 sum += cards[j].getValue();
             }
             if (sum == 15){
                 description.push("15 for 2");
                 permPoints += 2;
             }
             if (cards.length == 1){ // nobs
                 description.push("nobs for 1");
                 var c = cards[0];
                 if (c !== starter && c.number === JACK && c.suit === starter.suit){
                     permPoints += 1;
                 }
             }
             if (cards.length == 2 && cards[0].number == cards[1].number){
                 description.push("two of a kind for 2");
                 permPoints += 2; // 2 of a kind.
             }
             if (cards.length >= 3){ // straights
                 var last = cards[cards.length-1];
                 j = cards.length-1;
                 var isStraight = true;
                 while (j--){
                     if (last.number !== cards[j].number+1){
                         isStraight = false;
                         break;
                     }
                     last = cards[j];
                 }
                 if (isStraight){
                     description.push("straight for "+cards.length);
                     permPoints += cards.length;
                 }
             }
             if (cards.length >= 4){ //flushes
                 var suit = cards[0].suit;
                 j = cards.length;
                 var isFlush = true;
                 while (j--){
                     if (j.suit !== suit){
                         isFlush = false;
                         break;
                     }
                 }
                 if (isFlush){
                     description.push("flush for "+cards.length);
                     permPoints += cards.length;
                 }
             }
             if (permPoints){
                 log(cards.join(" "), "-->", description.join(", "));
             }
             points += permPoints;
         }
         return points;
     }

     /**
      * Get permuations of stuff.
      */
     function permute(items){
         var perms = [];
         for (var i=0, ii=items.length; i<ii; i++){
             var base = [items[i]];
             perms.push(base);
             var subitems = permute(items.slice(i+1));
             var j = subitems.length;
             while (j--){
                 perms.push(base.concat(subitems[j]));
             }
             //for (var j=0, jj=subitems.length; j<jj; j++){
             //    perms.push(base.concat(subitems[j]));
             //}
         }
         return perms;
     }

     cribbage.model = (
         function(){

             function Card(number, suit){
                 this.number = number;
                 this.suit = suit;
                 Card.all = Card.all || {};
                 Card.all[this.getId()] = this;
             }

             function numberToChar(number){
                 if (number <= 10 && number > 1){
                     return ""+number;
                 } else {
                     switch (number){
                     case ACE:
                         return "A";
                     case JACK:
                         return "J";
                     case QUEEN:
                         return "Q";
                     case KING:
                         return  "K";
                     }
                 }
                 return "";
             }

             function suitToChar(suit){
                 switch (suit){
                 case SPADES:
                     return "&spades;";
                 case HEARTS:
                     return "&hearts;";
                 case CLUBS:
                     return "&clubs;";
                 case DIAMONDS:
                     return "&diams;";
                 }
                 return "";
             }

             Card.prototype.toHtml = function(){
                 var suit = suitToChar(this.suit);
                 return '<div id="'+this.getId()+'" class="card '+suit.slice(1,suit.length-1)+'">'
                     + '  <div class="corner tl">'
                     + '    <span class="num">'+numberToChar(this.number)+'</span>'
                     + '    <span class="suit">'+suit+'</span>'
                     + '  </div>'
                     + '  <div class="corner br">'
                     + '    <span class="num">'+numberToChar(this.number)+'</span>'
                     + '    <span class="suit">'+suit+'</span>'
                     + '  </div>'
                     + '</div>';

             };

             Card.prototype.getId = function(){
                 return "card-"+this.number+"-"+this.suit;
             };

             Card.fromId = function(id){
                 if (Card.all && Card.all[id]){
                     return Card.all[id];
                 }
                 var match = id.match(/card-(\d+)-(\d+)/);
                 var number = parseInt(match[1]);
                 var suit = parseInt(match[2]);
                 return new Card(number, suit);
             };

             /**
              * Get the value for this card.
              */
             Card.prototype.getValue = function(){
                 return Math.min(this.number, 10);
             };

             /**
              * compare two cards for sorting.
              */
             Card.cmp = function(a,b){
                 return a.number-b.number;
             };

             Card.prototype.toString = function(){
                 var r = numberToChar(this.number)+suitToChar(this.suit);
                 if (this.suit === HEARTS || this.suit == DIAMONDS){
                     r = "<font color='red'>"+r+"</font>";
                 }
                 return r;
             };

             /**
              * Model for a deck.
              */
             function Deck(){
                 this.cards = [];
                 for (var i=1; i <= KING; i++){
                     for (var j=1; j <= 4; j++){
                         this.cards.push(new Card(i, j));
                     }
                 }
             }

             Deck.prototype.toString = function(){
                 return "{Deck cards="+this.cards.join(" ")+"}";
             };

             /**
              * Shuffle the deck.
              */
             Deck.prototype.shuffle = function(){
                 for (var i=0, ii=this.cards.length; i<ii; i++){
                     var s = Math.floor(Math.random()*ii);
                     var temp = this.cards[i];
                     this.cards[i] = this.cards[s];
                     this.cards[s] = temp;
                 }
             };

             /**
              * Deal one card from the top of the deck.
              */
             Deck.prototype.deal = function(){
                 return this.cards.pop();
             };

             /**
              * Split the deck at the given index.
              */
             Deck.prototype.split = function(n){
                 this.cards = this.cards.slice(n).concat(this.cards.slice(0,n));
             };


             /**
              * Model for a single player.
              */
             function Player(name){
                 this.cards = [];
                 this.cardsToPlay = [];
                 this.points = 0;
                 this.name = name;
             }

             Player.prototype.toString = function(){
                 return "{Player points="+this.points+" cards="+this.cards.join(" ")+"}";
             };

             Player.prototype.addCard = function(card){
                 this.cards.push(card);
                 this.cardsToPlay.push(card);
                 this.sortCards();
             };

             /**
              * Sort the cards by their value.
              */
             Player.prototype.sortCards = function(){
                 this.cards.sort(Card.cmp);
                 this.cardsToPlay.sort(Card.cmp);
             };

             /**
              * Remove the card at the given index to be added to the crib.
              */
             Player.prototype.getCardsForCrib = function(indices){
                 //indices may also be actual card objects.
                 var cards = [];
                 if (typeof indices[0] === "number"){
                     indices.sort();
                     for (var i=0; i<indices.length; i++){
                         cards.push(this.cards.splice(indices[i]-i,1)[0]);
                         this.cardsToPlay.splice(indices[i]-i,1);
                     }
                 } else if (typeof indices[0] === "string"){
                     for (var i=0; i<indices.length; i++){
                         var j = this.cards.length;
                         while (j--){
                             if (this.cards[j].getId() === indices[i]){
                                 cards.push(this.cards.splice(j,1)[0]);
                                 this.cardsToPlay.splice(j,1);
                                 break;
                             }
                         }
                     }
                 }
                 return cards;
             };

             /**
              * Return n indexes for cards to put into the crib.
              * This should be the computers best attempt.
              * Currently oversimplified, just picks a random set of cards.
              */
             Player.prototype.pickCardsForCrib = function(n){
                 var indices = [];
                 var possible = [];
                 for (var i=0; i<this.cards.length; i++){
                     possible.push(i);
                 }
                 for (i=0; i<n; i++){
                     indices.push(possible.splice(Math.floor(Math.random()*possible.length),1)[0]);
                 }
                 var cards = this.getCardsForCrib(indices);
                 log(this.name, "picks cards for crib:",cards.join(' '));
                 return cards;
             };

             /**
              * Get a card to play.
              */
             Player.prototype.getCardToPlay = function(index){
                 if (typeof index === "number"){
                     return this.cardsToPlay.splice(index,1)[0];
                 } else if (typeof index === "string"){
                     var j = this.cardsToPlay.length;
                     while (j--){
                         if (this.cardsToPlay[j].getId() === index){
                             return this.cardsToPlay.splice(j,1)[0];
                         }
                     }
                 }
                 return null;
             };

             /**
              * Pick a card to play.  This is the computers best guess.
              * At this point we always just play the highest possible card.
              */
             Player.prototype.pickCardToPlay = function(round){
                 var card = null;
                 var i = this.cardsToPlay.length;
                 while (i--){
                     if (round.value + this.cardsToPlay[i].getValue() <= 31){
                         card = this.getCardToPlay(i);
                         break;
                     }
                 }
                 log(this.name, card ? "plays" : "goes", card);
                 return card;
             };

             /**
              * Determine whether or not this player can play a card.
              */
             Player.prototype.canPlay = function(round){
                 for (var i=0; i<this.cardsToPlay.length; i++){
                     if (round.value + this.cardsToPlay[i].getValue() <= 31){
                         return true;
                     }
                 }
                 return false;
             };

             function Round(players){
                 this.players = players;
                 this.deck = new Deck();
                 this.deck.shuffle();
                 this.crib = [];
                 this.starterCard = null;
                 this.played = [];
                 this.value = 0;
                 this.cantContinue = false;
                 this.finished = false;
                 this.lastPlayer = null;
             }

             /**
              * Add the given cards to the crib.
              */
             Round.prototype.addToCrib = function(cards){
                 this.crib = this.crib.concat(cards);
             };

             Round.prototype.playCard = function(card, player){
                 if (!card){ // this is a go.
                     log("Go");
                     return 0; // XXX: give a point to the next player.
                 }
                 this.played.push(card);
                 this.value += card.getValue();
                 log("-->", this.value);

                 var points = 0;
                 if (this.value == 15){
                     points += 2;
                     log(player.name, "has 15 for 2");
                 } else if (this.value == 31){
                     points += 2;
                     this.cantContinue = true;
                     log(player.name, "has 31 for 2.");
                 }
                 var isLastCard = true;
                 var canContinue = false;
                 for (var i=0; i < this.players.length; i++){
                     if (this.players[i].cardsToPlay.length > 0){
                         isLastCard = false;
                         if (this.players[i].canPlay(this)){
                             canContinue = true;
                         }
                     }
                 }
                 if (isLastCard){
                     log(player.name, "plays last card for 1.");
                     points += 1;
                     this.finished = true;
                 } else if (!canContinue){
                     log("No one else can continue.");
                     if (this.value < 31){
                         points += 1;
                         log(player.name, "gets 1.");
                     }
                     this.cantContinue = true;
                 }
                 this.lastPlayer = player;
                 return points;
             };

             /**
              * Set the round back to zero for another set of plays.
              */
             Round.prototype.zero = function(){
                 this.value = 0;
                 this.played = [];
                 this.cantContinue = false;
                 this.lastPlayer = null;
             };

             Round.prototype.toString = function(){
                 var r = "{Round\n";
                 r += "    deck="+this.deck+"\n";
                 r += "    starter="+this.starterCard+"\n";
                 r += "    crib="+this.crib.join(" ")+"\n";
                 r += "    played="+this.played.join(" ")+"\n";
                 r += "    value="+this.value+"}\n";
                 return r;
             };

             /**
              * Model for a single cribbage game.
              */
             function Cribbage(players){
                 if (players > 4 || players < 2){
                     throw "Must have between 2 and 4 players.";
                 }
                 players = players || 2; // default two players
                 this.players = [];
                 for (var i=0; i < players; i++){
                     this.players.push(new Player("player "+(i+1)));
                 }
                 this.dealer = null;
                 this.round = null;
             }
             Cribbage.prototype.toString = function(){
                 var r = "{Cribbage\n";
                 for (var i=0, ii=this.players.length; i<ii; i++){
                     r += "  p"+(i+1)+"="+this.players[i];
                     if (i == this.dealer){
                         r += "(dealer)";
                     }
                     r += "\n";
                 }
                 r += "  round="+this.round+"}\n";
                 return r;
             };

             /**
              * Determine if the game is finished.
              */
             Cribbage.prototype.isFinished = function(){
                 var i = this.players.length;
                 while (i--){
                     if (this.players[i].points >= 121){
                         return true;
                     }
                 }
                 return false;
             };

             /**
              * Start a new round.
              */
             Cribbage.prototype.newRound = function(){
                 log(" ");
                 log("-- new round --");
                 this.round = new Round(this.players);
                 this.dealer = this.getNextPlayerIndex(this.dealer === null ? -1 : this.dealer);
                 log(this.players[this.dealer].name, "is the dealer");
                 for (var i=0; i<this.players.length; i++){
                     this.players[i].cards = [];
                     this.players[i].cardsToPlay = [];
                 }
                 this.deal();
                 for (i=0; i<this.players.length; i++){
                     log(this.players[i].name, "dealt", this.players[i].cards.join(" "));
                 }
             };

             /**
              * Get the next player from the given offset... automatically wraps around.
              */
             Cribbage.prototype.getNextPlayer = function(n){
                 return this.players[this.getNextPlayerIndex(n)];
             };

             /**
              * Get the next player index
              */
             Cribbage.prototype.getNextPlayerIndex = function(n){
                 return n+1 >= this.players.length ? 0 : n+1;
             };

             /**
              * Deal cards to the players.
              */
             Cribbage.prototype.deal = function(){
                 var player = this.getNextPlayerIndex(this.dealer); // start with player to left of dealer.
                 var total = (this.getCribCardCountPerPlayer()+4)*this.players.length;
                 for (var i=0; i<total; i++){
                     this.players[player].addCard(this.round.deck.deal());
                     player = this.getNextPlayerIndex(player);
                 }
             };

             /**
              * Get the player who should split the deck.
              */
             Cribbage.prototype.getPlayerWhoSplits = function(){
                 return this.getNextPlayer(this.dealer);
             };

             /**
              * Split the deck and set the starter card.
              * Also add one card to the crib if necessary.
              */
             Cribbage.prototype.splitAndStart = function(n){
                 this.round.deck.split(n);
                 if (this.players.length % 2){
                     this.round.addToCrib(this.round.deck.deal());
                 }
                 this.round.starterCard = this.round.deck.deal();
             };

             Cribbage.prototype.getCribCardCountPerPlayer = function(){
                 return this.players.length <= 2 ? 2 : 1;
             };

             /*
              var hand = [new Card(JACK, SPADES),
              new Card(5, HEARTS),
              new Card(QUEEN, DIAMONDS),
              new Card(KING, DIAMONDS)];
              var starter = new Card(JACK, HEARTS);
              log(starter, '...', hand, getPointsForHand(hand, starter));
              */

             /*
             var c = new Cribbage(2);
             c.players[0].name = "Paul";
             c.players[1].name = "Meghan";
             log(c);
             var rounds = 0;
             while (!c.isFinished()){
                 rounds ++;
                 c.newRound();
                 c.round.addToCrib(c.players[0].pickCardsForCrib(c.getCribCardCountPerPlayer()));
                 c.round.addToCrib(c.players[1].pickCardsForCrib(c.getCribCardCountPerPlayer()));
                 log("Crib is",c.round.crib.join(" "));
                 c.splitAndStart(12);
                 log("Starter card is",c.round.starterCard);
                 var p = 0;
                 while (!c.round.finished){
                     var player = c.players[(p++)%2];
                     player.points += c.round.playCard(player.pickCardToPlay(c.round), player);
                     //document.write("<pre>"+c+"</pre>");
                     if (c.round.cantContinue){
                         log("new set --> 0");
                         c.round.zero();
                     }
                 }
                 log("<b>-- round finished --</b>");
                 var score = "Score: ";
                 var j = c.players.length;
                 while (j--){
                     var player = c.players[j];
                     log("Calculating points for", player.name);
                     var points = getPointsForHand(player.cards, c.round.starterCard);
                     log(player.name, "got", points, "points");
                     player.points += points;

                     if (j === c.dealer){
                         log("--");
                         log("Calculating the crib for", player.name);
                         points = getPointsForHand(c.round.crib, c.round.starterCard);
                         log(player.name, "got the crib for", points, "points");
                         player.points += points;
                     }
                     log("--");
                     score += player.name + " has "+player.points + " points";
                     if (j){
                         score += " and ";
                     }
                 }
                 log(score);
             }
             var j = c.players.length;
             var winner = c.players[j-1];
             var max = winner.points;
             while (j--){
                 if (c.players[j].points > max){
                     winner = c.players[j];
                     max = winner.points;
                 }
             }
             log("After",rounds,"rounds,",winner.name,"wins the game");
             log(c);
              */

             return {
                 Cribbage: Cribbage
             };


         })();




     cribbage.ui = (
         function(){

             var defaultCribbageUIConfig = {
                 introEl: "#intro",
                 newGameEl: "#new-game",
                 cardTableEl: "#card-table",
                 dealEl: "#deal",
                 handEl: "#hand",
                 cardEl: ".card",
                 deckEl: "#deck",
                 addToCribEl: "#add-to-crib",
                 splitDeckEl: "#split-deck",
                 instructionsEl: "#instructions",
                 playCountEl: "#play-tallie",
                 playedCardsEl: "#played-cards",
                 resultsEl: "#results",
                 continueEl: "#continue",
                 goEl: "#go"
             };

             function renderCards(cards){
                 var html = "";
                 for (var i=0; i<cards.length; i++){
                     html += cards[i].toHtml();
                 }
                 return html;
             }

             /**
              * proxy a function to control what "this" is.
              */
             function p(func, scope){
                 var wrapped = function(){
                     func.apply(scope, $.merge([this],arguments));
                 };
                 return wrapped;
             }

             function CribbageUI(config){
                 this.game = null;
                 this.introEl = null;
                 this.config = $.extend({},defaultCribbageUIConfig,config||{});
                 this.currentState = null;
                 this.states = [NewRoundState, ChooseCribState, SplitDeckState, PlayCardsState, FinishRoundState];
             }

             /**
              * Initialize the UI.  This should be called once all DOM is ready.
              */
             CribbageUI.prototype.init = function(){
                 // grab all the elements.
                 this.introEl = $(this.config.introEl).show();
                 this.newGameEl = $(this.config.newGameEl);
                 this.cardTableEl = $(this.config.cardTableEl);
                 this.instructionsEl = $(this.config.instructionsEl);

                 // bind all the elements
                 this.newGameEl.click(p(this.startNewGame, this));
             };

             CribbageUI.prototype.setInstructions = function(instructions){
                 this.instructionsEl.html(instructions);
             };

             CribbageUI.prototype.startNewGame = function(){
                 this.introEl.hide();
                 this.newGameEl.hide();
                 this.cardTableEl.show();
                 this.game = new cribbage.model.Cribbage();
                 this.game.newRound();
                 this.finishState();
                 //this.currentState = new NewRoundState(this).init();
             };

             CribbageUI.prototype.finishState = function(state){
                 if (this.currentState) this.currentState.destroy();
                 var NextState = this.states.shift();
                 if (NextState){
                     log("Moving to state: "+NextState.name);
                     this.currentState = new NextState(this).init();
                 } else {
                     log("Nothing left to do.");
                 }

             };

             function GameState(ui){
                 this.ui = ui;
                 this.config = ui.config;
                 this.human = ui.game.players[0];
                 this.computer = ui.game.players[1];
                 this.game = ui.game;
             }
             GameState.prototype.finish = function(){
                 this.ui.finishState(this);
             };
             GameState.prototype.destroy = function(){
                 // no-op
             };

             /**
              * A new round.
              */
             function NewRoundState(ui){
                 GameState.call(this, ui);
             }
             $.extend(NewRoundState.prototype, GameState.prototype);
             NewRoundState.prototype.init = function(){
                 this.dealEl = $(this.config.dealEl).show();
                 this.handEl = $(this.config.handEl).show();
                 this.dealEl.click(p(this.dealCards, this));
                 this.ui.setInstructions("Start the round by dealing the cards.");
                 return this;
             };
             NewRoundState.prototype.dealCards = function(){
                 this.handEl.html(renderCards(this.game.players[0].cards));
                 this.finish();
             };
             NewRoundState.prototype.destroy = function(){
                 this.dealEl.hide();
                 this.handEl.hide();
             };

             function ChooseCribState(ui){
                 GameState.call(this, ui);
             }
             $.extend(ChooseCribState.prototype, GameState.prototype);

             ChooseCribState.prototype.init = function(){
                 this.handEl = $(this.config.handEl);
                 this.cardEls = this.handEl.find(this.config.cardEl);
                 this.addToCribEl = $(this.config.addToCribEl);

                 this.handEl.show();
                 this.cardEls.click(p(this.toggleCardForCrib, this));
                 this.addToCribEl.hide();
                 this.addToCribEl.click(p(this.addCardsToCrib, this));
                 var count = this.game.getCribCardCountPerPlayer();
                 this.ui.setInstructions("Select "+count+" card"+(count>1?'s':'')+" for the crib.");
                 return this;
             };
             ChooseCribState.prototype.destroy = function(){
                 this.cardEls.unbind("click");
                 this.addToCribEl.hide().unbind("click");
             };

             ChooseCribState.prototype.addCardsToCrib = function(){
                 var self = this;
                 this.cardEls.each(
                     function(i, card){
                         card = $(card);
                         if (card.is(".selected")){
                             card.remove();
                             self.game.round.addToCrib(self.human.getCardsForCrib([card.attr('id')]));
                         }
                     });
                 // Add opponent's cards to crib.
                 this.game.round.addToCrib(this.computer.pickCardsForCrib(this.game.getCribCardCountPerPlayer()));
                 this.finish();
             };

             ChooseCribState.prototype.toggleCardForCrib = function(card){
                 card = $(card);
                 var isSelected = card.is(".selected");
                 var needed = this.ui.game.getCribCardCountPerPlayer();
                 var count = this.handEl.find(".selected").length;
                 if (isSelected){
                     card.removeClass("selected");
                     this.addToCribEl.hide();
                 } else if (count < needed){
                     card.addClass("selected");
                     if (count+1 == needed){
                         this.addToCribEl.show();
                     }
                 }
             };

             function SplitDeckState(ui){
                 GameState.call(this, ui);
             }
             $.extend(SplitDeckState.prototype, GameState.prototype);

             SplitDeckState.prototype.init = function(){
                 this.splitDeckEl = $(this.config.splitDeckEl).show();
                 this.deckEl = $(this.config.deckEl).show().addClass("card-stack");

                 this.splitDeckEl.click(p(this.splitTheDeck, this));
                 this.ui.setInstructions("Split the deck.");
                 return this;
             };

             SplitDeckState.prototype.destroy = function(){
                 this.splitDeckEl.hide().unbind("click");
             };

             SplitDeckState.prototype.splitTheDeck = function(){
                 this.game.splitAndStart(12); // XXX: allow selection of card to split.
                 this.deckEl.html(this.game.round.starterCard.toHtml()).removeClass("card-stack");
                 this.finish();
             };


             function PlayCardsState(ui){
                 GameState.call(this, ui);
             }
             $.extend(PlayCardsState.prototype, GameState.prototype);
             PlayCardsState.prototype.init = function(){
                 this.handEl = $(this.config.handEl);
                 this.cardEls = this.handEl.find(this.config.cardEl);
                 this.playCountEl = $(this.config.playCountEl);
                 this.goEl = $(this.config.goEl);
                 this.playedCardsEl = $(this.config.playedCardsEl);
                 this.continueEl = $(this.config.continueEl);

                 this.cardEls.click(p(this.playCard, this));
                 this.ui.setInstructions("Play your cards.");
                 return this;
             };

             PlayCardsState.prototype.destroy = function(){
                 this.playedCardsEl.html('').hide();
             };

             PlayCardsState.prototype.updateScore = function(){
                 this.playCountEl.html(this.game.round.value);
             };

             PlayCardsState.prototype.zero = function(){
                 this.game.round.zero();
                 this.playedCardsEl.html('');
             };

             PlayCardsState.prototype.waitForConfirmation = function(callback){
                 this.continueEl.show().unbind("click").click(
                     p(function(){
                           this.continueEl.hide();
                           callback.call(this);
                       },this));
             };

             PlayCardsState.prototype.playCard = function(cardToPlay){
                 if (!this.human.canPlay(this.game.round)){
                     log("human can't play... skipping");
                     return false;
                 }
                 cardToPlay = $(cardToPlay);
                 this.game.round.playCard(this.human.getCardToPlay(cardToPlay.attr("id")),
                                          this.human);
                 cardToPlay.unbind("click").appendTo(this.playedCardsEl);
                 this.updateScore();
                 if (this.game.round.finished){
                     log("round is finished. waiting for confirmation");
                     this.waitForConfirmation(this.finish);
                 } else if (this.game.round.cantContinue){
                     log("no one can continue. waiting for confirmation to zero out.");
                     this.waitForConfirmation(this.zero);
                 } else {
                     log("cpu can continue");
                     var p1Card = this.computer.pickCardToPlay(this.game.round);
                     if (p1Card){
                         $(p1Card.toHtml()).appendTo(this.playedCardsEl);
                     }
                     this.computer.points += this.game.round.playCard(p1Card, this.computer);
                     if (this.game.round.finished){
                         log("round is now finished");
                         this.waitForConfirmation(this.finish);
                     } else if (this.game.round.cantContinue){
                         log("no one else can continue. Waiting for confirmation to zero out.");
                         this.waitForConfirmation(this.zero);
                     } else if (!this.human.canPlay(this.game.round)){
                         log("human cannot play. Display go button and waiting for confirmation.");
                         this.goEl.show().click(p(this.go, this));
                     }
                 }
                 this.updateScore();
                 return true;
             };

             PlayCardsState.prototype.go = function(){
                 this.goEl.hide();
                 while (!this.game.round.cantContinue){
                     var p1Card = this.computer.pickCardToPlay(this.game.round);
                     $(p1Card.toHtml()).appendTo(this.playedCardsEl);
                     this.computer.points += this.game.round.playCard(p1Card, this.computer);
                 }
                 if (this.game.round.finished){
                     log("round is finished. waiting for confirmation.");
                     this.waitForConfirmation(this.finish);
                 } else {
                     log("no one else can go. waiting for confirmation.");
                     this.waitForConfirmation(this.zero);
                 }
             };

             function FinishRoundState(ui){
                 GameState.call(this, ui);
             }
             $.extend(FinishRoundState.prototype, GameState.prototype);

             FinishRoundState.prototype.init = function(){
                 this.resultsEl = $(this.config.resultsEl).show();
                 var humanPoints = getPointsForHand(this.human.cards, this.game.round.starterCard);
                 var computerPoints = getPointsForHand(this.computer.cards, this.game.round.starterCard);
                 var cribPoints = getPointsForHand(this.game.round.crib, this.game.round.starterCard);
                 this.resultsEl.html('You got '+humanPoints+" points. "
                                     + "The computer got "+computerPoints+" points. "
                                     + "And the crib is worth "+cribPoints+" points. ");
                 return this;
             };

             FinishRoundState.prototype.destroy = function(){
                 this.resultsEl.html('').hide();
             };


             return {
                 CribbageUI: CribbageUI
             };

         })();


      })();

$(function(){

//      GAME = null;
//
//      function startNewGame(){
//          $("#intro").hide();
//          GAME = new cribbage.model.Cribbage();
//      }
//
//      function renderCards(cards){
//          var html = "";
//          for (var i=0; i<cards.length; i++){
//              html += cards[i].toHtml();
//          }
//          return html;
//      }
//
//      function toggleCardForCrib(){
//          var isSelected = $(this).is(".selected");
//          var needed = GAME.getCribCardCountPerPlayer();
//          var count = $(this).parent().find(".selected").length;
//          if (isSelected){
//              $(this).removeClass("selected");
//              $("#add-to-crib").attr("disabled", true);
//          } else if (count < needed){
//              $(this).addClass("selected");
//              if (count+1 == needed){
//                  $("#add-to-crib").attr("disabled", false);
//              }
//          }
//      }
//
//      function dealCards(){
//          GAME.newRound();
//          $("#hand").append(renderCards(GAME.players[0].cards));
//          $("#hand .card").click(toggleCardForCrib);
//      }
//
//      function updateScoreBoard(){
//          $("#score-board").html("p1: "+GAME.players[0].points+" p2: "+GAME.players[1].points);
//          $("#play-tallie").html(GAME.round.value);
//      }
//
//      function playCard(){
//          var cardToPlay = this;
//          $(this).attr("id");
//          $("#hand .card").each(
//              function(i, card){
//                  if (card === cardToPlay){
//                      GAME.players[0].points += GAME.round.playCard(
//                          GAME.players[0].getCardToPlay($(card).attr("id")),
//                          GAME.players[0]);
//                  }
//              });
//          $(cardToPlay).appendTo("#played-cards");;
//          if (GAME.round.cantContinue){
//              GAME.round.zero();
//          } else {
//              var p1Card = GAME.players[1].pickCardToPlay(GAME.round);
//              $(p1Card.toHtml()).appendTo("#played-cards");
//              GAME.players[1].points += GAME.round.playCard(p1Card, GAME.players[1]);
//          }
//          updateScoreBoard();
//
//      }
//
//      function splitTheDeck(){
//          GAME.splitAndStart(12);
//          $("#split-deck").hide();
//          $("#deck").html(GAME.round.starterCard.toHtml()).removeClass("card-stack");
//          $("#hand .card").unbind("click",toggleCardForCrib).click(playCard);
//      }
//
//      function addToCrib(){
//          $("#hand .card").each(
//              function(i, card){
//                  if ($(card).is(".selected")){
//                      $(card).remove();
//                      GAME.round.addToCrib(GAME.players[0].getCardsForCrib($(card).attr('id')));
//                  }
//              });
//          // Add opponent's cards to crib.
//          GAME.round.addToCrib(GAME.players[1].pickCardsForCrib(GAME.getCribCardCountPerPlayer()));
//          $("#split-deck").show();
//      }
//
//      $("#new-game").click(startNewGame);
//      $("#deal").click(dealCards);
//      $("#add-to-crib").click(addToCrib);
//      $("#split-deck").click(splitTheDeck);
//
//
//      $("#new-game").click();
//
//      $("#instructions").html("");
//

      ui = new cribbage.ui.CribbageUI();
      ui.init();

  });
