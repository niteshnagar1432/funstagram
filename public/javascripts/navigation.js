var home = document.querySelector('.home');
    var profile = document.querySelector('.profile');
    var post = document.querySelector('.create');
    var search = document.querySelector('.search');
    var more = document.querySelector('.more');
    var actionBox = document.querySelector('.action-box');
    var saved = document.querySelector('.saved');
    var logOut = document.querySelector('.log-out');
    var message = document.querySelector('.message');
    var actionBoxShow = false;

    profile.addEventListener('click', function () {
        window.location.assign('/profile');
    });
    home.addEventListener('click', function () {
        window.location.assign('/dashbord');
    });
    post.addEventListener('click', function () {
        window.location.assign('/createpost');
    });
    search.addEventListener('click', function () {
        window.location.assign('/s');
    });
    more.addEventListener('click', function () {
        if (actionBoxShow == false) {
            actionBox.style.display = 'block';
            actionBoxShow = true;
        } else {
            actionBox.style.display = 'none';
            actionBoxShow = false;
        }
    });

    logOut.addEventListener('click', function () {
        window.location.assign('/logout');
    });
    saved.addEventListener('click', function () {
        window.location.assign('/saved');
    });
    message.addEventListener('click',()=>{
        window.location.assign('/msg');
    });