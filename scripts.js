//ideas
//Add timer

const IMAGE_MODE = "image" //text or image
const TEST_MODE = false //true or false
const searchurl = 'https://api.scryfall.com/cards/random';

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
        name: res.name,
        images: res.image_uris.normal,
        edhrec_rank: res.edhrec_rank,
        related_uris: res.related_uris,
    }
    return gotCard
  }

function getList(numberOfCards) {
    // aLoop: 
    for (let i = 0; i < numberOfCards; i++) {
        let result = getCards(searchurl)
        if (result.edhrec_rank == undefined) {i--; continue}
        // for (let k = 0; k < (card_array.length - 1);) {
        //     if (card_array[k].edhrec_rank == result.edhrec_rank) {i--; continue aLoop}
        // }
        card_array.push(result)
        addCardToWindow(card_array[i], i)
    }
}

function addCardToWindow(card, idee) {
    cardwindow = document.getElementById('card-window');

    const slide = document.createElement('div');
    slide.setAttribute('id', "slide" + idee);
    slide.classList.add('slide'); 

    if (IMAGE_MODE == "image") {
        const img = document.createElement('img')
        img.classList.add('slide-img'); 
        img.setAttribute('id', idee);
        img.src = card.images; //small, normal, large?
        img.setAttribute('onclick', 'guess(this.id)')
        slide.appendChild(img)
    } else {
        const textImg = document.createElement('div');
        textImg.classList.add('slide-text-img'); 
        textImg.setAttribute('id', idee);
        textImg.setAttribute('onclick', 'guess(this.id)')
        slide.appendChild(textImg)
    }
    // const slideName = document.createElement('div');
    // slideName.textContent = card.name
    // slide.appendChild(slideName)
    
    const slideScore = document.createElement('div');
    slideScore.setAttribute('id', "score" + idee);
    slideScore.textContent = 'Rank: ' + card.edhrec_rank
    if (TEST_MODE == false) {
    slideScore.style.opacity = '0';
    }
    slide.appendChild(slideScore)

    cardwindow.appendChild(slide)
    console.log('added slide')
}

function guess(card) {
    if (can_guess == false) return
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
        if (card_current < card_array.length - 1) {
            console.log('scroll' + card_current)
            let scrollnum = card_current + 1
            document.getElementById("slide" + scrollnum).scrollIntoView({behavior: 'smooth'});
        } else {
            start('keep')
        }
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
        const card = card_guess
        slide.classList.add('slide'); 

        const img = document.createElement('img')
        img.classList.add('slide-img'); 
        img.src = card.images; //small, normal, large?
        img.onclick = function(e) {
            document.location = card_guess.related_uris.edhrec;
          }
        slide.appendChild(img)

        const slideScore = document.createElement('div');
        slideScore.textContent = 'Rank: ' + card.edhrec_rank
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
    getList(10)
    document.getElementById("slide0").scrollIntoView({behavior: 'smooth'});
}

start()