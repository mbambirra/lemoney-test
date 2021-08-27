const adminOffersTable = document.getElementById('adminOffersTable')
const addItemForm = document.getElementById('addItemForm')
const editItemForm = document.getElementById('editItemForm')
const editItemModal = new bootstrap.Modal(document.getElementById('editItemModal'), { backdrop: 'static' })

load()

function slugify(str) {
  str = str.toLowerCase()
  str = str.replace(/^\s+|\s+$/g, '')
  const from = "ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;"
  const to   = "aaaaaeeeeeiiiiooooouuuunc------"
  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i))
  }
  str = str.replace(/[^a-z0-9 -]/g, '')
  str = str.replace(/\s+/g, '-')
  return str
}

function isValidDate(dateString){
    if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)){ return false }
    var parts = dateString.split("/")
    var day = parseInt(parts[0], 10)
    var month = parseInt(parts[1], 10)
    var year = parseInt(parts[2], 10)
    if(year < 1000 || year > 3000 || month == 0 || month > 12){ return false}
    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ]
    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)){ monthLength[1] = 29 }
    return day > 0 && day <= monthLength[month - 1]
}

async function load() {
  const res = await fetch('http://localhost:3000/').then((data) => data.json())
  res.offers.map(offer => addElement(offer))
}

function addElement({ id, advertiser_name, url, description, starts_at, ends_at, premium, status }) {
  const tr = document.createElement('tr')
  tr.id = id

  const offerId = document.createElement('td')
  const offerName = document.createElement('td')
  const offerUrl = document.createElement('td')
  const offerStatus = document.createElement('td')
  const offerActions = document.createElement('td')

  const actionsBtnGroup = document.createElement('div')
  actionsBtnGroup.classList.add('btn-group')
  actionsBtnGroup.setAttribute('role', 'group')
  actionsBtnGroup.setAttribute('aria-label', 'Item actions')

  const actionEdit = document.createElement('button')
  actionEdit.innerHTML = 'Edit'
  actionEdit.type = 'button'
  actionEdit.classList.add('btn')
  actionEdit.classList.add('btn-secondary')
  actionEdit.classList.add('btn-sm')
  actionEdit.onclick = () => selectItemToEdit(id)

  const actionChangeStatus = document.createElement('button')
  actionChangeStatus.type = 'button'
  if(offerStatus == 'enabled'){
    actionChangeStatus.innerHTML = 'Disable'
    actionChangeStatus.onclick = () => changeStatus(id, 'disabled')
  } else {
    actionChangeStatus.innerHTML = 'Enable'
    actionChangeStatus.onclick = () => changeStatus(id, 'enabled')
  }
  actionChangeStatus.classList.add('btn')
  actionChangeStatus.classList.add('btn-secondary')
  actionChangeStatus.classList.add('btn-sm')

  const actionDestroy = document.createElement('button')
  actionDestroy.innerHTML = 'Destroy'
  actionDestroy.type = 'button'
  actionDestroy.classList.add('btn')
  actionDestroy.classList.add('btn-secondary')
  actionDestroy.classList.add('btn-sm')
  actionDestroy.onclick = () => removeElement(id)

  offerId.innerHTML = id
  offerName.innerHTML = advertiser_name
  offerUrl.innerHTML = `<a href="`+url+`" target="_blank">`+url+`</a>`
  offerStatus.innerHTML = status

  actionsBtnGroup.append(actionEdit)
  actionsBtnGroup.append(actionChangeStatus)
  actionsBtnGroup.append(actionDestroy)

  offerActions.append(actionsBtnGroup)

  tr.append(offerId)
  tr.append(offerName)
  tr.append(offerUrl)
  tr.append(offerStatus)
  tr.append(offerActions)

  adminOffersTable.append(tr)
}


async function addNewOffer(advertiser_name, url, description, starts_at, ends_at, premium, status) {
  if (url.substr(-1) != '/'){ url += '/' }
  let body = {
    action: 'create',
    data: {
      id: slugify(advertiser_name),
      advertiser_name: advertiser_name,
      url: url,
      description: description,
      starts_at: starts_at,
      ends_at: ends_at,
      premium: premium,
      status: status
    }
  }
  const res = await fetch('http://localhost:3000/', {
    method: 'POST',
    body: JSON.stringify(body)
  })
  alert(JSON.parse(JSON.stringify(await res.json())).message)
  clearList()
}

async function selectItemToEdit(id) {

  const res = await fetch('http://localhost:3000/?id='+id).then((data) => data.json())

  console.log(res)

  document.getElementById('idEdit').value = res.id
  document.getElementById('advertiserNameEdit').value = res.advertiser_name
  document.getElementById('urlEdit').value = res.url
  document.getElementById('descriptionEdit').value = res.description
  document.getElementById('startsAtEdit').value = res.starts_at
  document.getElementById('endsAtEdit').value = res.ends_at
  document.getElementById('statusEdit').value = res.status
  if(res.premium){
    document.getElementById('premiumEdit').checked = true
  } else {
    document.getElementById('premiumEdit').checked = false
  }

  editItemModal.show()
}

async function editElement(id, advertiser_name, url, description, starts_at, ends_at, premium, status) {
  let body = {
    action: 'edit',
    data: {
      id: id,
      advertiser_name: advertiser_name,
      url: url,
      description: description,
      starts_at: starts_at,
      ends_at: ends_at,
      premium: premium,
      status: status
    }
  }
  console.log(body)
  const res = await fetch('http://localhost:3000/', {
    method: 'POST',
    body: JSON.stringify(body)
  })
  alert(JSON.parse(JSON.stringify(await res.json())).message)
  clearList()
}

async function changeStatus(id, status) {
  if (confirm('Are you sure you want to change this offer status?')){
    let body = {
      action: 'change_status',
      data: {
        id: id,
        status: status
      }
    }
  
    const res = await fetch('http://localhost:3000/', {
      method: 'POST',
      body: JSON.stringify(body)
    })
  
    alert(JSON.parse(JSON.stringify(await res.json())).message)
    clearList()
  }
}

async function removeElement(id) {
  if (confirm('Are you sure you want to delete this offer?')){
    let body = {
      action: 'destroy',
      data: {
        id: id
      }
    }
    console.log(body)
    const res = await fetch('http://localhost:3000/', {
      method: 'POST',
      body: JSON.stringify(body)
    })
    alert(JSON.parse(JSON.stringify(await res.json())).message)
    clearList()
  }
}

function clearList() {
  adminOffersTable.innerHTML = ""
  load()
}

addItemForm.addEventListener('submit', (event) => {
  event.preventDefault()

  let advertiser_name = document.getElementById('advertiserName').value
  let url = document.getElementById('url').value
  let description = document.getElementById('description').value
  let starts_at = document.getElementById('startsAt').value
  let ends_at = document.getElementById('endsAt').value
  let premium = document.getElementById('premium').checked
  let status = 'disabled'

  if(!advertiser_name || !url || !description || !starts_at){
    return alert('Fill in the required fields!')
  }

  if(!/^http/.test(url)){
    return alert("Enter the url correctly!")
  }

  if(description.length > 500){
    return alert("The description exceeds the 500 character limit!")
  }

  if(!isValidDate(starts_at)){
    return alert("Enter the start date correctly! Format: dd/mm/yyyy")
  }

  if(ends_at && !isValidDate(ends_at)){
    return alert("Enter the end date correctly! Format: dd/mm/yyyy")
  }

  var today = new Date()
  var starts = new Date(starts_at)

  if(today >= starts){
    status = 'enabled'
  }

  if(ends_at){
    var ends = new Date(ends_at)
    if(today >= ends){
      status = 'disabled'
    }
  }

  addNewOffer(advertiser_name, url, description, starts_at, ends_at, premium, status)
  
  advertiser_name.value = ""
  url.value = ""
  description.value = ""
  starts_at.value = ""
  ends_at.value = ""
  premium.checked = false
})

editItemForm.addEventListener('submit', (event) => {
  event.preventDefault()

  let id = document.getElementById('idEdit').value
  let advertiser_name = document.getElementById('advertiserNameEdit').value
  let url = document.getElementById('urlEdit').value
  let description = document.getElementById('descriptionEdit').value
  let starts_at = document.getElementById('startsAtEdit').value
  let ends_at = document.getElementById('endsAtEdit').value
  let premium = document.getElementById('premiumEdit').checked
  let status = document.getElementById('statusEdit').value

  if(!advertiser_name || !url || !description || !starts_at){
    return alert('Fill in the required fields!')
  }

  if(!/^http/.test(url)){
    return alert("Enter the url correctly!")
  }

  if(description.length > 500){
    return alert("The description exceeds the 500 character limit!")
  }

  if(!isValidDate(starts_at)){
    return alert("Enter the start date correctly! Format: dd/mm/yyyy")
  }

  if(ends_at && !isValidDate(ends_at)){
    return alert("Enter the end date correctly! Format: dd/mm/yyyy")
  }

  editElement(id, advertiser_name, url, description, starts_at, ends_at, premium, status)
  
  id.value = ""
  advertiser_name.value = ""
  url.value = ""
  description.value = ""
  starts_at.value = ""
  ends_at.value = ""
  premium.checked = false
  status.value = 'disabled'

  editItemModal.hide()
})