document.addEventListener('DOMContentLoaded', function() {
    var slider = document.querySelectorAll('.slider');
    var select = document.querySelectorAll('select');
    var parallax = document.querySelectorAll('.parallax');
    var fullWidthCarousel = document.querySelectorAll('.carousel.full-width-carousel');
    var filmCarousel = document.querySelectorAll('.carousel.film-carousel');
    var tabs = document.querySelectorAll('.tabs');
    var materialbox = document.querySelectorAll('.materialboxed');
    var fixedActionBtn = document.querySelectorAll('.fixed-action-btn');
    var tooltip = document.querySelectorAll('.tooltipped');
    var modals = document.querySelectorAll('.modal');
    var collapsible = document.querySelectorAll('.collapsible');

    M.Slider.init(slider);
    M.FormSelect.init(select);
    M.Parallax.init(parallax);
    M.Tabs.init(tabs);
    M.Carousel.init(fullWidthCarousel, {
        fullWidth: true
    });
    M.Carousel.init(filmCarousel, {
        dist: 0,
        fullWidth: true
    });
    M.Materialbox.init(materialbox);
    M.FloatingActionButton.init(fixedActionBtn);
    M.Tooltip.init(tooltip);
    M.Modal.init(modals);
    M.Collapsible.init(collapsible);

    document.querySelectorAll('.tower-open-modal').forEach(function (button) {
        button.addEventListener('click', function(e) {
            var tower_modal = M.Modal.getInstance(document.querySelector('#tower-view'));

            tower_modal.open();
        });
    });
});