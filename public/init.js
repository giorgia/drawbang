var currentColor = "#000000";

function upload() {
  if(confirm("Want to save?")) {
    $.post('/upload', { imageData : pixel.getDataURL() }, function(data) {
      if(typeof data.thumb != 'undefined') {
        $("#images").prepend(data.thumb);
        pixel.clearCanvas();
      
        FB.ui({
          method: 'feed',
          name: 'My brand new drawing',
          link: data.share_url,
          picture: data.url,
          caption: 'Check my drawing out!',
          description: 'Do you like it?',
          message: 'Check my drawing out!',
          actions: [JSON.stringify({name: 'Draw!', link: 'http://draw.heroku.com/'})]
        },
        function(response) {
          if (response && response.post_id) {
            // alert('Post was published.');
          } else {
            // alert('Post was not published.');
          }
        });
      }
      else {
        alert(data);
      }
    }, "json");
  
    $(this).unbind('click').removeClass('enabled');
    $(this).addClass('disabled');
  }
  
  return false;
}

$(document).ready(function() {
  var canvas = $("#canvas canvas"),
      ctrlDown = false;
      ctrlKey = 17, zKey = 90, shiftKey = 16;

  pixel.init(canvas[0]);

  //set it true on mousedown
  canvas.mousedown(function(e) {
    pixel.setDraw(true);
    var x = e.offsetX ? e.offsetX : e.pageX - this.offsetLeft;
    var y = e.offsetY ? e.offsetY : e.pageY - this.offsetTop;
    
    pixel.doAction(x, y, currentColor);
    
    $("#upload.disabled").bind('click', upload).removeClass('disabled');
    $("#upload").addClass('enabled');
  }).mousemove(function(e) {
    var x = e.offsetX ? e.offsetX : e.pageX - this.offsetLeft;
    var y = e.offsetY ? e.offsetY : e.pageY - this.offsetTop;
    
    pixel.doAction(x, y, currentColor);
  });

  //reset it on mouseup
  $(document).mouseup(function() {
    pixel.setDraw(false);
  });
  
  // if shift is pressed set color to transparent
  $(document).keydown(function(e) {
    if(!ctrlDown && e.keyCode == shiftKey) {
      currentColor = "rgba(0, 0, 0, 0)";
      $(".clearPixel").addClass('active');
    }
  });
  
  // reset color to current active color
  $(document).keyup(function(e) {
    currentColor = $(".color.active").data().color;
    if($(".action.selectable.active").data().action != "clearPixel") {
      $(".clearPixel").removeClass('active');
    }
  });

  // controls
  $("#clear").click(function() {
    if($("#upload").hasClass('enabled') && confirm("Sure?")) {
      pixel.clearCanvas();
    
      $("#upload.enabled").unbind('click').removeClass('enabled');
      $("#upload").addClass('disabled');
    }
  });

  $(".action.selectable").click(function() {
    pixel.setAction($(this).data().action);
    
    $(".action.selectable.active").toggleClass("active");
    $(this).toggleClass("active");
  });

  $(".color").click(function() {
    currentColor = $(this).data().color;
    
    $(".color.active").toggleClass("active");
    $(this).toggleClass("active");
  });

  $(document).keydown(function(e) {
    e.keyCode == ctrlKey && ctrlDown = true;
    e.keyCode == shiftKey && shiftDown = true;
  }).keyup(function(e) {
    e.keyCode == ctrlKey && ctrlDown = false;
    e.keyCode == shiftKey && shiftDown = false;
  });

  $(document).keydown(function(e) {
    if(ctrlDown && e.keyCode == zKey) {
      if(shiftDown) {
        console.log("redo");
      }
      else {
        console.log("undo");
      }
    }
  });
  
  ["undo", "redo"].forEach(function(action) {
    $("." + action).click(function() {
      pixel[action].call();
      return false;
    });
  });
});