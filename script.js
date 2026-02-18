// Optional pause animation on hover
const logoTrack = document.querySelector(".logo-track");

logoTrack.addEventListener("mouseenter", () => {
  logoTrack.style.animationPlayState = "paused";
});

logoTrack.addEventListener("mouseleave", () => {
  logoTrack.style.animationPlayState = "running";
});

// Play button click animation
const playBtn = document.querySelector(".play-btn");

playBtn.addEventListener("click", () => {
  playBtn.style.transform = "translate(-50%, -50%) scale(0.9)";
  setTimeout(() => {
    playBtn.style.transform = "translate(-50%, -50%) scale(1)";
  }, 150);
});




// 2nd section 
 const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active from all
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      // Activate clicked
      tab.classList.add('active');
      const target = document.getElementById('panel-' + tab.dataset.tab);
      if (target) target.classList.add('active');
    });
  });


  