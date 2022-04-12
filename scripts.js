//--ideas--
//Add timed mode
//Add price mode
//History tab
//Settings tab
//background change at certain intervals

//ideas
//Add timer

//Responsive design DONEish
//Keyboard controls? DONEish

//--BUGS--
//double faced card? Fixed?
//Double clicking on a card giving you multiple points

const SEARCHURL = 'https://api.scryfall.com/cards/random';

//Settings
var image_mode = true //text or image
var test_mode = true //true or false
var game_mode = 'edh' //edh or usd TODO: make this

//History
var history = localStorage.getItem("history") || "0";

var card_array = []
var card_current = 0
var can_guess = true
var score_current = 0
var score_high = localStorage.getItem("score_high") || "0";


  function getCards(url) {
    let xmlHttpReq = new XMLHttpRequest();
    xmlHttpReq.open("GET", url, false); 
    xmlHttpReq.send(null);
    // console.log(xmlHttpReq.responseText)
    let res = JSON.parse(xmlHttpReq.responseText);
    var gotCard = {
        // layout: "modal_dfc"
        name: (res.name || res.card_faces[0].name),
        idee: card_array.length,
        images: (res.image_uris || res.card_faces[0].image_uris),
        edhrec_rank: res.edhrec_rank,
        related_uris: res.related_uris,
    }
    return gotCard
  }

function getList(numberOfCards) {
    console.log('Added ' + numberOfCards + ' to card_array')
    for (let i = 0; i < numberOfCards; i++) {
        let result = getCards(SEARCHURL)
        if (result.edhrec_rank == undefined) {i--; continue}
        card_array.push(result)
        addCardToWindow(card_array[card_array.length -1])
    }
}

function addCardToWindow(card) {
    cardwindow = document.getElementById('card-window');

    const slide = document.createElement('div');
    slide.setAttribute('id', "slide" + card.idee);
    slide.classList.add('slide'); 

    if (image_mode == true) {
        const img = document.createElement('img')
        img.classList.add('slide-img'); 

        img.setAttribute('id', card.idee);
        img.src = card.images.normal; //small, normal, large?

        img.setAttribute('onclick', 'guess(this.id)')
        slide.appendChild(img)
    } else {
        const textImg = document.createElement('div');
        textImg.classList.add('slide-text-img'); 
        textImg.setAttribute('id', card.idee);
        textImg.setAttribute('onclick', 'guess(this.id)')
        slide.appendChild(textImg)

        const slideName = document.createElement('div');
        slideName.textContent = card.name
        textImg.appendChild(slideName)
    }
    
    const slideScore = document.createElement('div');
    slideScore.setAttribute('id', "score" + card.idee);
    slideScore.textContent = 'Rank: ' + card.edhrec_rank
    if (test_mode == false) {
    slideScore.style.opacity = '0';
    }
    slide.appendChild(slideScore)

    cardwindow.appendChild(slide)
}

function guess(card) {
    if (can_guess == false) return
    // console.log(card)
    // if ((card !== card_current) && (card !== (card_current + 1))) return(alert('wtf'))
    can_guess = false
    getList(1)
    let card_guess, card_other
    let slidenum = card_current + 1
    if (card == card_current) {
        card_guess = card_array[card_current]
        card_other = card_array[slidenum]
    } else {
        card_guess = card_array[slidenum]
        card_other = card_array[card_current]
    }

    document.getElementById('score' + card_current).style.opacity = 1;
    document.getElementById('score' + slidenum).style.opacity = 1;

    if (card_guess.edhrec_rank < card_other.edhrec_rank) {
        score_current ++
        document.getElementById('score').textContent = `Score: ${score_current}`
        document.getElementById('score').style.color = "green";

        card_current ++;
        console.log('scroll' + card_current)
        let scrollnum = card_current + 1
        document.getElementById("slide" + scrollnum).scrollIntoView({behavior: 'smooth'});
        can_guess = true
    } else {
        document.getElementById('score').style.color = "red";
        gameOver(card_guess)
    }

}

function gameOver(card_guess){
    can_guess = false
    let cardwindow = document.getElementById('card-window');
    document.getElementById('score').textContent = ``;
    cardwindow.innerHTML = '';
    
    let window = document.createElement('div');
    window.classList.add('game-over'); 
    window.setAttribute('onclick', 'start()')

        const slide = document.createElement('div');
        slide.classList.add('slide'); 

        const img = document.createElement('img')
        img.classList.add('slide-img'); 

        img.src = card_guess.images.normal; //small, normal, large?


        img.onclick = function(e) {
            document.location = card_guess.related_uris.edhrec;
          }
        slide.appendChild(img)

        const slideScore = document.createElement('div');
        slideScore.textContent = 'Rank: ' + card_guess.edhrec_rank
        slide.appendChild(slideScore)

        cardwindow.appendChild(slide)
    
        const game_over_title = document.createElement('H1');
        const game_over_score = document.createElement('div');
        const game_over_best = document.createElement('div');

        if (score_current >= score_high && score_current !== 0) {
        localStorage.setItem("score_high", score_current);
        score_high = score_current
        game_over_title.textContent = 'New High Score!'
        game_over_score.textContent = `You scored a new personal best of ${score_current} point`
        game_over_score.textContent += (score_current == 1) ? '' : 's';
        } else {
        game_over_title.textContent = 'Game Over!'
        game_over_score.textContent = `You scored ${score_current} point`
        game_over_score.textContent += (score_current == 1) ? '' : 's';
        game_over_best.textContent = `Your best score was ${score_high}`
        }

        window.appendChild(game_over_title)
        window.appendChild(game_over_score)
        window.appendChild(game_over_best)
    
    cardwindow.appendChild(window)
}

function start(zero) {
    if (zero !== 'keep') {score_current = 0}
    document.getElementById('card-window').innerHTML = '';
    card_current = 0
    document.getElementById('score').textContent = `Score: ${score_current}`
    card_array = []
    can_guess = true
    getList(5)
    document.getElementById("slide0").scrollIntoView({behavior: 'smooth'});
}

document.addEventListener('keypress', (event) => {
    var name = event.code;
    console.log(name)

    if (['ShiftLeft', 'ArrowLeft', 'Digit0', 'Numpad1'].includes(name)) {
        guess(card_array[card_current])
    }

    if (['ShiftRight', 'ArrowRight', 'Digit1', 'Numpad2', 'Numpad3'].includes(name)) {
        guess(card_array[card_current] + 1)
    }

    if (['Space', 'KeyR'].includes(name)) {
        start()
    }

  }, false);

  window.addEventListener('resize', function(event) { //TODO: Fix this
    document.getElementById('slide0').scrollIntoView;
    document.getElementById("slide" + card_current).scrollIntoView;
    document.getElementById("slide" + (card_current + 1)).scrollIntoView;

}, true);

start()