var langs =
[
 ['English',         ['en-AU', 'Australia'],
                     ['en-CA', 'Canada'],
                     ['en-IN', 'India'],
                     ['en-NZ', 'New Zealand'],
                     ['en-ZA', 'South Africa'],
                     ['en-GB', 'United Kingdom'],
                     ['en-US', 'United States']],
 ['Português',       ['pt-BR', 'Brasil'],
                     ['pt-PT', 'Portugal']],
];
var fileContent = [];
function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object
  
    for (var i = 0, f; f = files[i]; i++) {
      var reader = new FileReader();
       reader.onload = function(e) {
            fileContent = reader.result.split("\n");
            //Here the content has been read successfuly
        }
      reader.readAsText(f)
    }
  }
 const client = new ApiAi.ApiAiClient({accessToken: '8ce0cd91499e49f8a07919557f0563d4 '}); 
 function handleResponseDialog(serverResponse) {
        console.log(serverResponse);
}
function handleErrorDialog(serverError) {
        console.log(serverError);
}
function requestDialogFlow(lines){
  console.log(lines);
   for(line in lines){
    console.log(lines[line]);
    if(lines[line].length >0 ){
       const promise = client.textRequest(lines[line]);
       promise.then(handleResponseDialog).catch(handleErrorDialog);
      }
  }

}
function requestWitAi(lines){
  for(line in lines){
    if(lines[line].length >0)
      $.ajax({
        url: 'https://api.wit.ai/message',
        data: {
          'q': lines[line],
          'access_token' : 'CVRXOUQAUEP3RCXP5W2XUXIMB4X437YU'
        },
        dataType: 'JSON',
        method: 'GET',
        success: function(response) {
            console.log("success!", response);
        }
      });
  }
}
function agentsRequest(flag,lines){
  console.log("RANDOM: "+flag);
   switch(Number(flag)){
  case 1:
  requestWitAi(lines);
  break;

  case 2:
  console.log("CALLING: "+flag)
  requestDialogFlow(lines);
  break;
  
  case 3:
  requestDialogFlow(lines);
  requestWitAi(lines);
  break;

  default:
   console.log("Not working");
  } 

}
document.getElementById('uploadFile').addEventListener('change', handleFileSelect, false);
$("#fileInput").submit(function(event) {
  console.log("SUBMITTING FILES");
  //Prevent the default action of the event: in this case, prevent form from submitting data 
  event.preventDefault();
  event.stopPropagation();
  var voiceInput;
  if (final_transcript.length > 0) 
    voiceInput = final_transcript.split("\n");
  else
    voiceInput = [];
  //Data will have what has been spoken and what has been sent as text
  finalArray = fileContent.concat(voiceInput);


  //decide which API it will call (array that way we can call both easily)
  var dropdownValue = $("#agentSelect").val();
  console.log(finalArray);
  console.log(dropdownValue);
  // Will do the Ajax Requests
  agentsRequest(dropdownValue,finalArray);
  //TODO might have problem in spoken part of the API we'll see in the future

});
select_language = $("#select_language")[0]
select_dialect = $("#select_dialect")[0]
var final_transcript = '';
var recognizing = false;
var ignore_onend;
var start_timestamp;
for (var i = 0; i < langs.length; i++) {
  select_language.options[i] = new Option(langs[i][0], i);
}
select_language.selectedIndex = 0;
updateCountry();
select_dialect.selectedIndex = 5;
showInfo('info_start');
uploadFile.style.display = 'inline-block';
submit_button.style.display = 'inline-block';
function updateCountry() {
  for (var i = select_dialect.options.length - 1; i >= 0; i--) {
    select_dialect.remove(i);
  }
  var list = langs[select_language.selectedIndex];
  for (var i = 1; i < list.length; i++) {
    select_dialect.options.add(new Option(list[i][1], list[i][0]));
  }
  select_dialect.style.visibility = list[1].length == 1 ? 'hidden' : 'visible';
}

if (!('webkitSpeechRecognition' in window)) {
  upgrade();
} else {
  start_button.style.display = 'inline-block';
  var recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.onstart = function() {
    recognizing = true;
    showInfo('info_speak_now');
    start_img.src = '../assets/mic-animate.gif';
  };
  recognition.onerror = function(event) {
    if (event.error == 'no-speech') {
      start_img.src = '../assets/mic.gif';
      showInfo('info_no_speech');
      ignore_onend = true;
    }
    if (event.error == 'audio-capture') {
      start_img.src = '../assets/mic.gif';
      showInfo('info_no_microphone');
      ignore_onend = true;
    }
    if (event.error == 'not-allowed') {
      if (event.timeStamp - start_timestamp < 100) {
        showInfo('info_blocked');
      } else {
        showInfo('info_denied');
      }
      ignore_onend = true;
    }
  };
  recognition.onend = function() {
    recognizing = false;
    if (ignore_onend) {
      return;
    }
    start_img.src = '../assets/mic.gif';
    if (!final_transcript) {
      showInfo('info_start');
      return;
    }
    showInfo('');
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
      var range = document.createRange();
      range.selectNode(document.getElementById('final_span'));
      window.getSelection().addRange(range);
    }
  };
  recognition.onresult = function(event) {
    var interim_transcript = '';
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        if(final_transcript.length > 0 )
          final_transcript += "\r\n" + event.results[i][0].transcript;
        else
          final_transcript += event.results[i][0].transcript;
      } else {
        interim_transcript += event.results[i][0].transcript;
      }
    }
    final_transcript = capitalize(final_transcript);
    final_span.innerHTML = linebreak(final_transcript);
    interim_span.innerHTML = linebreak(interim_transcript);
    if (final_transcript || interim_transcript) {
      showButtons('inline-block');
    }
  };
}
function upgrade() {
  start_button.style.visibility = 'hidden';
  showInfo('info_upgrade');
}
var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}
function revertLineBreak(s){
          var test = s.replace('<div>',one_line);
          test = test.replace('</div>','');
  return  test.replace( '<p></p>',two_line).replace( '<br>',one_line);
}
var first_char = /\S/;
function capitalize(s) {
  return s.replace(first_char, function(m) { return m.toUpperCase(); });
}

 
function startButton(event) {
  if (recognizing) {
    recognition.stop();
    return;
  }
  final_transcript = '';
  recognition.lang = select_dialect.value;
  recognition.start();
  ignore_onend = false;
  final_span.innerHTML = '';
  interim_span.innerHTML = '';
  start_img.src = '../assets/mic-slash.gif';
  showInfo('info_allow');
  showButtons('none');
  start_timestamp = event.timeStamp;
}
function submit(){
  if (recognizing) {
    recognizing = false;
    recognition.stop();
  }
  submit_button.style.display = 'none';
  showInfo('');
}
function showInfo(s) {
  if (s) {
    for (var child = info.firstChild; child; child = child.nextSibling) {
      if (child.style) {
        child.style.display = child.id == s ? 'inline' : 'none';
      }
    }
    info.style.visibility = 'visible';
  } else {
    info.style.visibility = 'hidden';
  }
}
var current_style;
function showButtons(style) {
  if (style == current_style) {
    return;
  }
  current_style = style;
}
