<template>
  <div
    class="caption-bar"
    v-bind:class="{ 'caption-bar--active': isActive }"
  >
    <div class="caption-bar__answer">{{ caption.text }}</div>
    <div contenteditable="true"
      :id="'captionInput'+caption.startTimeMs"
      ref="captionInput"
      class="caption-bar__input"
      v-bind:class="{ 'caption-bar__input--active': isActive }"
      @click="onCaptionClick"
      @blur="onEdit"
      @keydown.space="onSpace"
    ></div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { Prop, Watch, Ref } from 'vue-property-decorator';
import { Caption } from '../types/Caption';

@Options({
})

export default class CaptionBar extends Vue {
  @Prop() caption!: Caption;
  @Prop() isActive!: boolean;

  mounted() {
  }

  @Watch('isActive')
  onChangeActive(value: boolean) {
    if (this.isActive) {
      // TODO: move it to the center
      const input = document.getElementById(`captionInput${this.caption.startTimeMs}`);
      if (input) {
        input.focus();
      }
    }
  }

  onCaptionClick(event: any) {
    const startTimeMS = parseInt(event.srcElement.id.replace("captionInput", ""));
    this.$emit("caption-click", startTimeMS);
  }

  onSpace(event: Event) {
    const id = (event.target as Element).id
    const inputDiv = document.querySelector(`#${id}`) as HTMLDivElement;
    const inputWords = this.getWordsOfInput(inputDiv.innerHTML);
    const answerWords = this.getWordsOfAnswer(this.caption.text);
    console.log("answerwords: ", answerWords);
    let inner = "";
    for (let i = 0; i < inputWords.length; i++) {
      if (i < answerWords.length) {
        if (inputWords[i].replace(/[`~!@#$%^&*()_|+\-=?;:'",.\n\t\{\}\[\]\\]/gi, "").toLowerCase() === answerWords[i].toLowerCase()) {
          // good to go
          inner += inputWords[i] + " ";
        } else { // wrong
          inner += `<span>${inputWords[i]} </span>`;
        }
      } else { // wrong
        inner += `<span>${inputWords[i]} </span>`;
      }
    }
    inputDiv.innerHTML = inner;
    
    this.setCaretLast(id);
  }

  //Not my function.
  setCaretLast(el: string) {
    var elElement = document.getElementById(el) as HTMLElement;
    // var range = document.createRange();
    // var sel = window.getSelection() as Selection;
    // const lastChildNode = elElement.childNodes[elElement.childNodes.length-1];
    // range.setStart(lastChildNode, 2);
    // range.collapse(true);
    // sel.removeAllRanges();
    // sel.addRange(range);
    // elElement.focus();
    this.setEndOfContenteditable(elElement);
  }

  setEndOfContenteditable(contentEditableElement: HTMLElement)
  {
    var range,selection;
    if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
    {
      range = document.createRange();//Create a range (a range is a like the selection but invisible)
      range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
      range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
      selection = window.getSelection() as Selection;//get the selection object (allows you to change selection)
      selection.removeAllRanges();//remove any selections already made
      selection.addRange(range);//make the range you have just created the visible selection
    }
    // else if(document.selection)//IE 8 and lower
    // { 
    //     range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
    //     range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
    //     range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
    //     range.select();//Select the range (make it the visible selection
    // }
  }

  // TODO: limit the size (# of chars) of caption bar input! 

  spellCheck(answer: string[], input: string[]) {
  }

  getWordsOfAnswer(text: string) {
    text = text.replace(/\n/g, " ");
    const refined = text.replace(/[`~!@#$%^&*()_|+\-=?;:'",.\n\t\{\}\[\]\\]/gi, "");
    const words = refined.split(" ").filter(word => 
      word != "" && word.match(/[`~!@#$%^&*()_|+\-=?;:'",.\n\t\{\}\[\]\\]/gi) == null
    );
    return words;
  }

  getWordsOfInput(text: string) {
    text = text.replace(/&nbsp;/g, " ");
    // const refined = text.replace(/[`~!@#$%^&*()_|+\-=?;:'",.\n\t\{\}\[\]\\]/gi, "");
    const words = text.split(/<\/?span>| /).filter(word => word != "");
    return words;
  }
}
</script>

<style>
.caption-bar {
  /* height: 50px; */
  width: 500px;
  text-align: left;
  padding: 5px 10px;
  margin-bottom: 20px;
  border-radius: 7px;
  background-color: #F3F1F5;
}
.caption-bar--active {
  background-color: #64C9CF;
}
.caption-bar__answer {
  margin-bottom: 5px;
  color: transparent;
  text-shadow: 0 0 8px #111;
  transition: 0.2s;
}
.caption-bar__answer:hover {
  color: #111;
  text-shadow: none;
}

.caption-bar__input {
  width: 100%;
  border: 1px solid lightseagreen;
}

.wrong {
  color: red;
}

span {
  color: red;
}

/* h1 {
  font-size: 4em;
  text-align: center;
  color: transparent;
  text-shadow: #111 0 0 15px;
  transition: 0.4s;
  font-family: HelveticaNeue;
  
  &:hover {
    color: #111;
    text-shadow: none;
  }
} */

.caption-bar__input{
  width: 100%;
}
</style>
