$(function (){
    var logged, registred, user_name, _location;
    var current_page;
    // Verifying if the use is logged  
    
    var menu_items = $('#menu-main-menu li');
    current_page = localStorage.getItem('current_page') == null ? 0 : localStorage.getItem('current_page'); 
    
    //#region SECTION: Modal Settings
    $('#modal').on('click', function () {  
        $('#modal-container').addClass('hidden');
    })
    function modal_message( message){
        $('#modal-container').removeClass('hidden')
        $('#message').text(message)
    }
    //#endregion
})