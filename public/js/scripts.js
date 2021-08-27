const offersList = document.getElementById('offersList')

load()

async function load() {
  const activeOffers = await fetch('http://localhost:3000/?active=true').then((data) => data.json())
  
  const sortedActiveOffers = sortByPremium(activeOffers)
  sortedActiveOffers.map(offer => addElement(offer))
}

function sortByPremium(arr) {
  arr.sort( function(a,b){ return a.premium - b.premium }).reverse()
  return arr
}

function addElement({ id, advertiser_name, url, description, starts_at, ends_at, premium, status }) {

  const container = document.createElement('div')
  container.classList.add('col-12')
  container.classList.add('col-md-6')
  container.classList.add('col-lg-3')

  const card = document.createElement('card')
  card.classList.add('card')
  card.classList.add('text-center')
  card.classList.add('text-light')
  card.classList.add('bg-custom')
  card.classList.add('mb-3')
  card.id = id

  const cardBody = document.createElement('div')
  cardBody.classList.add('card-body')

  const cardTitle = document.createElement('h5')
  cardTitle.classList.add('card-title')
  cardTitle.classList.add('text-custom')
  cardTitle.innerHTML = advertiser_name

  const cardText = document.createElement('p')
  cardText.classList.add('card-text')
  cardText.innerHTML = description

  const cardButton = document.createElement('a')
  cardButton.classList.add('btn')
  cardButton.classList.add('btn-success')
  cardButton.innerHTML = 'Shop Now'
  cardButton.href = url
  cardButton.setAttribute('target', '_blank')

  if(premium){
    card.classList.add('position-relative')
    const cardBadge = document.createElement('span')
    cardBadge.classList.add('position-absolute')
    cardBadge.classList.add('top-0')
    cardBadge.classList.add('start-90')
    cardBadge.classList.add('translate-middle')
    cardBadge.classList.add('badge')
    cardBadge.classList.add('rounded-pill')
    cardBadge.classList.add('bg-danger')
    cardBadge.innerHTML = 'premium'
    card.append(cardBadge)
  }
  
  cardBody.append(cardTitle)
  cardBody.append(cardText)
  cardBody.append(cardButton)
  card.append(cardBody)
  container.append(card)

  offersList.append(container)
}