

(function($) {

	"use strict";

	var fullHeight = function() {

		$('.js-fullheight').css('height', $(window).height());
		$(window).resize(function(){
			$('.js-fullheight').css('height', $(window).height());
		});

	};
	fullHeight();

	$('#sidebarCollapse').on('click', function () {
      $('#sidebar').toggleClass('active');
  });

})(jQuery);

//Multi Group.......
function getCookie(name) {
  let cookieArr = document.cookie.split(";");
  for (let i = 0; i < cookieArr.length; i++) {
      let cookiePair = cookieArr[i].split("=");
      if (name === cookiePair[0].trim()) {
          try {
              return decodeURIComponent(cookiePair[1]);
          } catch (e) {
              console.error("Error decoding cookie value", e);
              return null;
          }
      }
  }
  return null;
}

var usr_val=JSON.parse(getCookie('User'));
console.log(usr_val);

var receiver_id;

       
      var skt=io('/user-namespace',{
              auth:{
                token:usr_val._id
              }

      });
      
      
      var sender_id=usr_val._id
      
      $(document).ready(function(){
               $('.user-list').click(function(){

                var Uid=$(this).attr('data_id');
                receiver_id=Uid;
                console.log(receiver_id);
                $('.start-head').hide();
                $('.chat-section').show();
                skt.emit('existsChat',{sender_id:sender_id,receiver_id:receiver_id});

               })

       })
      
      
    

      //update online status
      skt.on('getOnlineUser',function(data){
            $('#'+data.user_id+'-status').text('Online');
            $('#'+data.user_id+'-status').removeClass('offline_status');
            $('#'+data.user_id+'-status').addClass('online_status');

      });
       
      skt.on('getOfflineUser',function(data){
            $('#'+data.user_id+'-status').text('Offline');
            $('#'+data.user_id+'-status').removeClass('online_status');
            $('#'+data.user_id+'-status').addClass('offline_status');
      });

      $('#chat-form').submit(function(event){
            event.preventDefault();
            var message=$('#message').val();
            console.log(message); 
            $.ajax({
                 url:'/save_chat',
                 type:'POST',
                 data:{ sender_id:sender_id,receiver_id:receiver_id,message:message},
                 success:function(res){
                         if(res.success){
                             console.log(res);
                            $('#message').val('');
                            let chat=res.data.message;
                            let html=` <div class="current-user-chat">
                                      <h5><span>`+chat+ `</span>
                                      <i class="fa fa-trash" aria-hidden="true" data_id='`+res.data._id+`'  data-toggle="modal" data-target="#deletechat"></i>  
                                      <i class="fa fa-edit" aria-hidden="true" data_id='`+res.data._id+`' data-msg='`+chat+`' data-toggle="modal" data-target="#updatechat"></i>  
                                      </h5>
                                      </div>`;
                            $('#chat-container').append(html);
                            skt.emit('newChat',res.data);

                         }
                         else{
                                  alert(res.msg);
                         }

                    }});

      });

      skt.on('loadnewChat',function(data){
        if(sender_id == data.receiver_id  &&  receiver_id == data.sender_id)
        { 
        let html=` <div class="distance-user-chat" id='`+data._id+`'>
          <h5><span>`+data.message+ `</span></h5>
          </div>`;
        $('#chat-container').append(html);
        }  
        else{
          let html='';
          $('#chat-container').append(html);

        }      
           
      });
        skt.on('loadChats',function(data){
                 $('#chat-container').html('');
                 var chats=data.chats;
                 var html='';
                 for(let x=0;x<chats.length;x++)
                 {
                    let cls='';
                    if(chats[x]['sender_id']==sender_id)
                    {
                       cls='current-user-chat';
                    }
                    else{
                      cls='distance-user-chat'
                    }
                       html+=`<div class="`+cls+`" id='`+chats[x]['_id'] +`'>
                  
                                      <h5><span>`+chats[x]['message']+ `</span>`;
                        if(chats[x]['sender_id']==sender_id)
                        {
                          html+=`<i class="fa fa-trash" aria-hidden="true" data_id='`+chats[x]['_id'] +`'  data-toggle="modal" data-target="#deletechat"></i>`;
                          html+=`   <i class="fa fa-edit" aria-hidden="true" data_id='`+chats[x]['_id']+`' data-msg='`+chats[x]['message']+`' data-toggle="modal" data-target="#updatechat"></i>  `
                        }
                                        
                          html+=`</h5>
                                      </div>`;
                 }
                 $('#chat-container').append(html);

        })


        //delete chat work
        $(document).on('click','.fa-trash',function(){
                let msg=$(this).parent().text();
                $('#delete-message').text(msg);
                $('#delete-message-id').val($(this).attr('data_id'));

        })

        $('#delete-chat-form').submit(function(e){
               e.preventDefault();
               var id=$('#delete-message-id').val();
               console.log(id);
               $.ajax({
                   url:'/delete_chat',
                   type:"POST",
                   data:{id:id},
                   success:function(res){
                        if(res.success)
                        {
                           $('#'+id).remove();
                           $('#deletechat').modal('hide');
                           skt.emit('DeletedChat',id);
                        }
                        else{
                               alert(res.msg);
                        }
                   }       

               });

        });
   

          skt.on('Deletethis',function(data){

            $('#'+data).remove();

          })


          //update chat
          $(document).on('click','.fa-edit',(function(){

                    $('#edit-message-id').val($(this).attr('data_id'));
                    $('#edit-message').val($(this).attr('data-msg'));
             
          }));

          $('#update-chat-form').submit(function(e){
               e.preventDefault();
               var id=$('#edit-message-id').val();
               var message=$('#edit-message').val();
              
               $.ajax({
                   url:'/update_chat',
                   type:"POST",
                   data:{id:id,message:message},
                   success:function(res){
                        if(res.success)
                        {
                          //We can't update it with help of database because it need's reload operation
                          console.log(message);
                           $('#updatechat').modal('hide');
                           $('#'+id).find('span').text(message);
                           $('#'+id).find('.fa-edit').attr('data-msg',message);
                           skt.emit('UpdatedChat',{id:id,message:message});
                        }
                        else{
                               alert(res.msg);
                        }
                   }       

               });

        });

        skt.on('Updatethismsg',function(data){
                    //$('#'+data.id).find('span').html('');
                    $('#'+data.id).find('span').text(data.message);

        })
    
  //addmember in groups
  
  $('.addMember').click(function(data){
   
            var id=$(this).attr('data_id');
            var limit=$(this).attr('data_limit');
            $('#group_id').val(id);
            $('#limit').val(limit);

            $.ajax({
                     url:'/fetchmember',
                     type:'POST',
                     data:{group_id:id},
                     success:function(res){
                      console.log(res);
                             if(res.success)
                             {
                                let users=res.data;
                                let html='';
                                for(let i=0;i<users.length;i++){
                                  let isMemberGroup=users[i]['member'].length>0?true:false;
                                  html+=` <tr><td>
                                         <input type="checkbox" `+(isMemberGroup?'checked':'')+` name="members[]" value="`+users[i]['_id']+`">
                                  </td>
                                  <td>
                                  `+users[i]['name']+`
                                  </td>
                                  </tr>
                                  
                                  `;
                                }
                                $('.addmembersintable').html(html)
                             }
                             else{
                              alert(res.mesg);
                             }

                     }


            })


  })

  //add member form submit
  $(document).ready(function() {         
    $('#add-member-form').submit(function (event) { 
        event.preventDefault();   
        var data=$(this).serializeArray();
       
    $.ajax({
      url:'/addMembers',
      type:'POST',
      data:data,
     
      success:function(res){
        if(res.success)
        {
          alert(res.msg);
          $('#memberModal').modal('hide');
          $('#add-member-form')[0].reset();
        }
        else{
          $('.add-member-error').text(res.msg);
          setTimeout(()=>{
            $('#add-member-error').text('')
          },3000);
        }
      }
    })
  })
  });

  //update group script

  $('.updateMember').click(function(){

     var obj=JSON.parse($(this).attr('data_obj'));
    console.log(obj._id);
     $('#Update_group_id').val(obj._id);
     $('#last_limit').val(obj.limit);
     $('#group_name').val(obj.name);
     $('#group_limit').val(obj.limit);
  });

  $('#UpdateChatGroupForm').submit(function(e){
    e.preventDefault();
    $.ajax({
       url:'/Update-chat-groups',
       type:'POST',
       data:new FormData(this),
       contentType:false,
       cache:false,
       processData:false,
       success:function(res){
           alert(res.msg);
           if(res.success)
           {
            location.reload();
           }
       }



    })

  })

  //delete chatgroup

  $('.deleteGroup').click(function(){
   $('#delete_group_id').val( $(this).attr('data-id'));
   $('#delete_group_name').text( $(this).attr('data-name'));  

  });

  $('#deleteChatGroupForm').submit(function(e){
     e.preventDefault();
     var fd=$(this).serializeArray();
     $.ajax({
      url:'/delete-chat-groups',
      type:'POST',
      data:fd,
      success:function(res){
        alert(res.msg);
        if(res.success)
        {
          location.reload(); 
        }
      }


     })

  })

  //-----Copy Sharable Link

  $('.copy').click(function(){
     $(this).prepend('<span class="copied_text">Copied</span>');
     var group_id=$(this).attr('data-id');
     var url=window.location.host+'/share-group/'+group_id;
     var temp=$("<input>");
     $("body").append(temp);
     temp.val(url).select();
     document.execCommand("copy");
     temp.remove();
     setTimeout(()=>{
      $('.copied_text').remove();
     },2000);


  })

  //join group script
  $('.join-now').click(function(){
     $(this).text('Wait..');
     $(this).attr('disabled','disabled');
     var group_id=$(this).attr('data-id');
     $.ajax({
       url:"/join-group",
       type:'POST',
       data:{group_id:group_id},
       success:function(res)
       {
        alert(res.msg);
          if(res.success)
          {
            location.reload();
          }
          else
          {
            alert(res.msg);
            $(this).text('JOIN');
            $(this).removeAttr('disabled');

          }
       }


     })

  })

  //group chat start
  var global_group_id;

  $('.group-list').click(function(){
    $('.group-start-head').hide();
    $('.group-chat-section').show();
    global_group_id=$(this).attr('data_id');
    loadGroupchat();

  });


  $('#group-chat-form').submit(function(event){
    event.preventDefault();
    var message=$('#group-message').val();
    console.log(message); 
    $.ajax({
         url:'/group_save_chat',
         type:'POST',
         data:{ sender_id:sender_id,group_id:global_group_id,message:message},
         success:function(res){
                 if(res.success){
                     console.log(res.chat);
                   $('#group-message').val('');
                    let message=res.chat.message;
                    let html=` <div class="current-user-chat" id='`+res.chat._id+`'>
                              <h5><span>`+message+ `</span>
                              <i class="fa fa-trash deleteGroupChat" aria-hidden="true" data_id='`+res.chat._id+`'  data-toggle="modal" data-target="#deleteGroupchatModal"></i>  
                               <i class="fa fa-edit editGroupChat" aria-hidden="true" data_msg='`+message+`'   data_id='`+res.chat._id+`' data-toggle="modal" data-target="#updateGroupchatModal"></i>    
                              </h5>
                              </div>`;
                    $('#group-chat-container').append(html);
                    skt.emit('newGroupChat',res.chat);

                 }
                 else{
                          alert(res.msg);
                 }

            }});

});

skt.on('ldchatGrp',function(dt){
  
 if(global_group_id==dt.group_id)
 {
    let html=` <div class="distance-user-chat" id='`+dt._id+`'>
          <h5><span>`+dt.message+ `</span></h5>
          </div>`;
        $('#group-chat-container').append(html);
 }
  
});

function loadGroupchat() {
  $.ajax({
        url:"/load-group-chat",
        type:'POST',
        data:{group_id:global_group_id},
        success:function(res){
            if(res.success){
              var chats=res.chats;
              var html='';
              for(let i=0;i<chats.length;i++)
              {
                let className='distance-user-chat'
                if(chats[i]['sender_id']==sender_id)
                {
                  className='current-user-chat';
                }
                html+=`<div class="`+className+`" id='`+chats[i]['_id']+`'>
          <h5><span>`+chats[i]['message']+ `</span>`;
          if(chats[i]['sender_id']==sender_id)
            {
             html+=` <i class="fa fa-trash deleteGroupChat" aria-hidden="true" data_id='`+chats[i]['_id']+`'  data-toggle="modal" data-target="#deleteGroupchatModal"></i> 
              <i class="fa fa-edit editGroupChat" aria-hidden="true" data_msg='`+chats[i]['message']+`'   data_id='`+chats[i]['_id']+`'  data-toggle="modal" data-target="#updateGroupchatModal"></i>    
                              
             ` 
                               
            }
          html+=`
          </h5>
          </div>`;
              }
              $('#group-chat-container').html(html);
            }
            else{
              alert(res.msg);
            }
        }

  })
  
}

//delgrpchat

$(document).on('click','.deleteGroupChat',function(){

var msg=$(this).parent().find('span').text();
console.log(msg);
$('#delete-group-message').text(msg);
$('#delete-group-message-id').val($(this).attr('data_id'));
});

$('#delete-group-chat-form').submit(function(e){

e.preventDefault();
var id=$('#delete-group-message-id').val();
$.ajax({

     url:'/del_grp_chat',
     type:'POST',
     data:{id:id},
     success:function(res){
      if(res.success){
           $('#'+id).remove();
           $('#deleteGroupchatModal').modal('hide');
           skt.emit('DelGroupchat',id);

      }
      else{
        alert(res.msg);
      }
     }



})

});

//deleteGroupMessage
skt.on('DeletedGrpMessage',function(id){
  $('#'+id).remove();
})


//Update Group Chat Message

$(document).on('click','.editGroupChat',function(){

  $('#edit-group-message-id').val($(this).attr('data_id'));
  $('#edit-group-message').val($(this).attr('data_msg'));
  
  
  });
  
  $('#update-Groupchat-form').submit(function(e){
  
  e.preventDefault();
  var id=$('#edit-group-message-id').val();
  var msg=$('#edit-group-message').val();
  $.ajax({
  
       url:'/update_grp_chat',
       type:'POST',
       data:{id:id,message:msg},
       success:function(res){
        if(res.success){
            
             $('#updateGroupchatModal').modal('hide');
             $('#'+id).find('span').text(msg);
             $('#'+id).find('.editGroupChat').attr('data_msg',msg);
             skt.emit('EditGroupchat',{id:id,message:msg});
  
        }
        else{
          alert(res.msg);
        }
       }
  })
  
  });


  skt.on('EditGrpMessage',function(data){
    $('#'+data.id).find('span').text(data.message);
  
  })