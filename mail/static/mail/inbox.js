document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit',send_email);
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-detail-view').style.display='none';
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


function view_email(id){
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      console.log(email);
      document.querySelector('#emails-view').style.display='none';
      document.querySelector('#compose-view').style.display='none';
      document.querySelector('#email-detail-view').style.display='block';
      
      document.querySelector('#email-detail-view').innerHTML=
      `
        <h5><strong>From:</strong> ${email.sender}</h5>
        <h5><strong>To: </strong>${email.recipients}</h5>
        <h5><strong>Subject: </strong>${email.subject}</h5>
        <h5><strong>Timestamp: </strong>${email.timestamp}</h5>
        <h5>${email.body}</h5>
      `;
      if(!email.read){
        fetch(`emails/${email.id}`,{
          method:'PUT',
          body:JSON.stringify({
            read:true
          })
        })
      }
      const btn_arch=document.createElement('button');
      btn_arch.innerHTML = email.archived ? "Unarchive" : "Archive";
      btn_arch.className=email.archived? "btn btn-success":"btn btn-danger";
      btn_arch.addEventListener('click',function(){
        fetch(`/emails/${email.id}`,{
          method:'PUT',
          body:JSON.stringify({
            archived:!email.archived
          })        
        })
        .then(()=>{
          if(email.archived){
            load_mailbox('inbox');
          }else{
            load_mailbox('archive');
          }
        });
      });
      document.querySelector('#email-detail-view').append(btn_arch);
      
      const reply_btn=document.createElement('button');
      reply_btn.innerHTML="Reply";
      reply_btn.className="btn btn-info";
      reply_btn.addEventListener('click',function(){
        compose_email();
        document.querySelector('#compose-recipients').value=email.sender;
        let subject=email.subject;
        if(!subject.startsWith("Re:")){
          subject="Re: "+email.subject;
        }
        document.querySelector('#compose-subject').value=subject;
        document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
      });
      document.querySelector('#email-detail-view').append(reply_btn);
  });
}
function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-detail-view').style.display='none';
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response=>response.json())
  .then(emails=>{
    emails.forEach(singleEmail=>{
      console.log(singleEmail);
      const newEmail=document.createElement('div');
      newEmail.className='list-group-item';
      newEmail.innerHTML=
      `
        <h5>Sender: ${singleEmail.sender}</h5>
        <h5>Subject: ${singleEmail.subject}</h5>
        <p>${singleEmail.timestamp}</p>
      `;
      newEmail.className=singleEmail.read?'read':'unread';
      newEmail.addEventListener('click',function(){
        view_email(singleEmail.id);
      });
      document.querySelector('#emails-view').append(newEmail);
    })
  });
}

function send_email(event){
  event.preventDefault();
  fetch('/emails',{
    method:'POST',
    body:JSON.stringify({
      recipients:document.querySelector('#compose-recipients').value,
      subject:document.querySelector('#compose-subject').value,
      body:document.querySelector('#compose-body').value
    })
  })
  .then(response=>response.json())
  .then(result=>{
    console.log(result);
    load_mailbox('sent');
  });
}

