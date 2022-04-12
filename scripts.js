//--ideas--
//Add timed mode
//Add price mode
//Collect backgrounds

//TODO
//History tab
//Settings tab? Image mode? test mode? Reset PB
//Add landscape display?

//Responsive design DONE
//Keyboard controls? Done
//background change at certain intervals (random basics) DONE

//--BUGS--
//double faced card? Fixed?
//Double clicking on a card giving you multiple points FIXED

screen.orientation.lock('portrait-primary') //This doesn't even work

const SEARCHURL = 'https://api.scryfall.com/cards/random';

//Settings
var image_mode = true //text or image
var test_mode = false //true or false
var game_mode = 'edh' //edh or usd TODO: make this

var changing_background = false;

//History
var history = JSON.parse(localStorage.getItem("history") || "[]");

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
    slideScore.textContent = 'Rank: ' + card.edhrec_rank.toLocaleString('en-US')
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

    document.getElementById('slide' + card_current).classList.add('transparent'); 
    document.getElementById(card_current).onclick = "";

    document.getElementById('score').textContent = `Score: ${score_current}`

    if (card_guess.edhrec_rank < card_other.edhrec_rank) {
        score_current ++
        

        if (changing_background == true) {
            switch (score_current) {
                case 5:
                    backgroundChange('plains');
                    break
                case 10:
                    backgroundChange('island');
                    break
                case 15:
                    backgroundChange('swamp');
                    break
                case 20:
                    backgroundChange('mountain');
                    break
                case 30:
                    backgroundChange('forest');
                    break
                case 100:
                    backgroundChange('waste');
                    break
                default:
                    document.body.style.backgroundImage = "";
                    break
            }
        }

        card_current ++;
        console.log('scroll' + card_current)
        document.getElementById('card-window').scrollTo({
            top: 0,
            left: document.getElementById('card-window').scrollWidth,
            behavior: 'smooth'
          });
        setTimeout(function(){ can_guess = true; }, 200)
    } else {
        setTimeout(function(){ gameOver(card_guess); }, 600)
    }
}

function backgroundChange(land) {
    let background = 'https://api.scryfall.com/cards/search?as=grid&order=released&q=%21' + land + '+include%3Aextras&unique=prints'
    console.log(background)
    let xmlHttpReq = new XMLHttpRequest();
    xmlHttpReq.open("GET", background, false); 
    xmlHttpReq.send(null);
    let res = JSON.parse(xmlHttpReq.responseText);

    let gotcard = res.data
    num = Math.floor(Math.random() * gotcard.length);
    let bg = gotcard[num].image_uris.art_crop || "";
    document.body.style.backgroundImage = "url(" + bg + ")";

}

function addHistory() {
    //TODO
}

function gameOver(card_guess){

    // history.push(card_array) 
    // localStorage.setItem("history", JSON.stringify(history));

    let cardwindow = document.getElementById('card-window');
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
        slideScore.textContent = 'Rank: ' + card_guess.edhrec_rank.toLocaleString('en-US')
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
    document.body.style.backgroundImage = "";

    if (zero !== 'keep') {score_current = 0}
    document.getElementById('card-window').innerHTML = '';
    card_current = 0
    document.getElementById('score').textContent = `Score: ${score_current}`
    card_array = []
    can_guess = true
    getList(2)
    document.getElementById('card-window').scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
}

document.addEventListener('keypress', (event) => {
    var name = event.key;
    console.log(name)

    if (['ArrowLeft', 'q'].includes(name)) {
        guess(card_array.length - 2)
    }

    if (['ArrowRight', 'w'].includes(name)) {
        guess(card_array.length - 1)
    }

    if (['Space', 'r'].includes(name)) {
        start()
    }

  }, false);

  window.addEventListener('resize', function(event) { //TODO: Fix this
    document.getElementById('card-window').scrollTo({
        top: 0,
        left: document.getElementById('card-window').scrollWidth,
        behavior: 'smooth'
      });
}, true);

function historyShow(){
    backgroundChange('Swamp')
}

start()