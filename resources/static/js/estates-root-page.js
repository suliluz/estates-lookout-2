document.addEventListener('DOMContentLoaded', function() {
    var sidenav = document.querySelectorAll(".sidenav");
    var carousel = document.querySelectorAll(".carousel");
    var full_carousel = document.querySelectorAll(".carousel.full-width");
    var testimonial_carousel = document.querySelectorAll("#testimonials .carousel")
    var materialboxed = document.querySelectorAll(".materialboxed");
    var desgined_for_agents_developers_carousel = document.querySelectorAll("#designed-for-agents-developers .carousel");

    var carousel_controllers = document.querySelectorAll(".carousel-controller");

    M.AutoInit();
    
    M.Sidenav.init(sidenav);
    M.Carousel.init(carousel);
    M.Carousel.init(desgined_for_agents_developers_carousel, {
        fullWidth: true,
        indicators: true
    });
    M.Carousel.init(full_carousel, {
        fullWidth: true,
        indicators: true
    });
    M.Carousel.init(testimonial_carousel, {
        fullWidth: true,
        numVisible: 5,
        spacing: "1rem"
    });
    M.Materialbox.init(materialboxed);

    carousel_controllers.forEach(function (element) {
        var prev = element.querySelector(".prev");
        var next = element.querySelector(".next");
  
        var target = element.dataset.target;
        var carousel_instance = M.Carousel.getInstance(document.getElementById(target));
  
        prev.onclick = function () {
          carousel_instance.prev();
        }
  
        next.onclick = function () {
          carousel_instance.next();
        }
  
      });

      document.querySelectorAll(".read-more-container").forEach(function (container) {
          var sentence_container = container.querySelector(".sentence-container");

          var sentences = sentence_container.textContent.split(".");
          var firstSentence = "";

          var more_container_element = document.createElement('span');
          var read_toggle = document.createElement('p');

          more_container_element.classList.add("more", "no-display");

          read_toggle.classList.add("default-size-paragraph","main-color-text");
          read_toggle.dataset.state = "more";

          read_toggle.textContent = "Read More";

          sentences.forEach((sentence, index) => {
            if(index != 0) {
              more_container_element.textContent += sentence + ".";
            } else {
              firstSentence = sentence;
            }
          });

          read_toggle.addEventListener("click", (e) => {
            var currentState = e.target.dataset.state;
            var moreContainer = sentence_container.querySelector(".more");

            if(currentState === "less") {
              moreContainer.classList.add("no-display");
              e.target.textContent = "Read More";
              e.target.dataset.state = "more";
            } else {
              moreContainer.classList.remove("no-display");
              e.target.textContent = "Read Less";
              e.target.dataset.state = "less";
            }
          });

          sentence_container.innerHTML = firstSentence + ".";
          sentence_container.appendChild(more_container_element);
          container.appendChild(read_toggle);
      });
});