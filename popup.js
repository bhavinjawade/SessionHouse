function getAllUrls(sessionName) {
  chrome.tabs.query({currentWindow: true}, tabs => {    
    let tabUrls = []
    tabs.forEach(tab => tabUrls.push(tab.url)) 
    saveSession(sessionName, tabUrls)
 })
}

function saveSession(sessionName, tabs) {
  chrome.storage.sync.set({[sessionName]:tabs})
}

document.addEventListener('DOMContentLoaded', () => {
  const saveButton = document.getElementById('savebtn')
  saveButton.addEventListener('click', () => {
    const sessionName = document.getElementById('sessionname').value
    sessionName ? getAllUrls(sessionName) : null
  })
})

async function loadSessionList() {
  const sessions = await getSavedSessions()
  
  $('#SessionList').empty()

  $.each(sessions, (key, value) => {
    $('#SessionList').append(`<option value=${key}>${key}</option><`)
  })
}

function getSavedSessions() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get((sessions) => {
      
      if(!chrome.runtime.lastError) {
        resolve(sessions)
      } else {
        reject(chrome.runtime.lastError)
      }
    })
  })
}

function restoreSavedSession() {
  const session = document.getElementById('SessionList');
  const sessionKey = session.options[session.selectedIndex].value;
  
  chrome.storage.sync.get(sessionKey, (sessionObj) => {
    
    const links = sessionObj[sessionKey]

    chrome.tabs.query({currentWindow: true}, function (tabs) {
      tabs.forEach(tab => chrome.tabs.remove(tab.id))
    })

    links.forEach(link => chrome.tabs.create({active:false, url:link}))
  })
}

function removeSavedSession() {
  const session = document.getElementById('SessionList');
  const sessionKey = session.options[session.selectedIndex].value;
  chrome.storage.sync.remove(sessionKey)
  // update list
  loadSessionList()
}

document.addEventListener('DOMContentLoaded', () => {
    loadSessionList()
    let restore = document.getElementById('restore')
    let remove = document.getElementById('remove')
    restore.addEventListener('click', () => restoreSavedSession())
    remove.addEventListener('click', () => removeSavedSession())
})