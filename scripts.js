// fetch selection of cards under certain parameters and return a random card from the selection
//add card to card array, add card to dom, scroll to new card
//check winner on click

const IMAGE_MODE = "image" //text or image

var card_array = []
var card_current = 0
var can_guess = true
var score_current = 0
var score_high = JSON.parse(localStorage.getItem("score_high") || "0");

function getCards(url) {
    let xmlHttpReq = new XMLHttpRequest();
    xmlHttpReq.open("GET", url, false); 
    xmlHttpReq.send(null);
    // console.log(xmlHttpReq.responseText)
    return JSON.parse(xmlHttpReq.responseText);
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
    }
}

var searchurl = 'https://api.scryfall.com/cards/random';

function addCardToWindow(card, idee) {
    cardwindow = document.getElementById('card-window');

    const slide = document.createElement('div');
    slide.setAttribute('id', "slide" + idee);
    slide.classList.add('slide'); 

    if (IMAGE_MODE == "image") {
        const img = document.createElement('img')
        img.classList.add('slide-img'); 
        img.setAttribute('id', idee);
        img.src = card.image_uris.normal; //small, normal, large?
        img.setAttribute('onclick', 'guess(this.id)')
        slide.appendChild(img)
    } else {
        const textImg = document.createElement('div');
        textImg.classList.add('slide-text-img'); 
        textImg.setAttribute('id', idee);
        textImg.setAttribute('onclick', 'guess(this.id)')
        slide.appendChild(textImg)
    }
    const slideName = document.createElement('div');
    slideName.textContent = card.name
    slide.appendChild(slideName)
    
    const slideScore = document.createElement('div');
    slideScore.setAttribute('id', "score" + idee);
    slideScore.textContent = 'Rank: ' + card.edhrec_rank
    slideScore.style.opacity = '0';
    slide.appendChild(slideScore)

    cardwindow.appendChild(slide)
}

function guess(card) {
    if (can_guess == false) return
    let card_guess, card_other
    let slidenum = card_current + 1
    if (card == card_current) {
        card_guess = card_array[card_current].edhrec_rank
        card_other = card_array[slidenum].edhrec_rank
    } else {
        card_guess = card_array[slidenum].edhrec_rank
        card_other = card_array[card_current].edhrec_rank
    }

    document.getElementById('score' + card_current).style.opacity = 1;
    document.getElementById('score' + slidenum).style.opacity = 1;

    if (card_guess < card_other) {
        score_current ++
        document.getElementById('score').textContent = `Score: ${score_current}`
        document.getElementById('score').style.color = "green";
    } else {
        document.getElementById('score').style.color = "red";
    }


    card_current ++;
    if (card_current < card_array.length - 1) {
        console.log('scroll' + card_current)
        let scrollnum = card_current + 1
        document.getElementById("slide" + scrollnum).scrollIntoView({behavior: 'smooth'});
    } else {can_guess = false} //TODO: end function
}

function start() {
    document.getElementById('card-window').innerHTML = '';
    card_current = 0
    score_current = 0
    card_array = []
    can_guess = true
    getList(10)
    for (let i = 0; i < card_array.length; i++) {
        addCardToWindow(card_array[i], i)
    }
    document.getElementById("slide0").scrollIntoView({behavior: 'smooth'});
}

start()