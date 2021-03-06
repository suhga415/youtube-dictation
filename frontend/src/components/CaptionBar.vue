<template>
  <div
    class="caption-bar"
    v-bind:style="{fontSize: fontSize + 'px'}"
    v-bind:class="{'caption-bar--active': isActive}"
  >
    <div
      class="caption-bar__answer"
      v-bind:class="{ 'caption-bar__answer--blur': isCaptionBlur }"
    ><span>{{ caption.text }}</span>
    </div>
    <div
      class="caption-bar__answer"
      v-bind:class="{ 'caption-bar__answer--blur': isTranslationBlur }"
    ><span>{{ caption.translation }}</span>
    </div>
    <div contenteditable="true"
      :id="'captionInput'+index"
      ref="captionInput"
      class="caption-bar__input"
      v-bind:class="{ 'caption-bar__input--active': isActive }"
      @click="onCaptionClick"
      @blur="onBlur"
      @paste="onPaste"
      @keydown.space="onSpace"
      @keyup.alt.right="togglePlay"
      @keyup.alt.up="goPrevCaption"
      @keyup.alt.down="goNextCaption"
      @keydown.enter="goNextCaption"
      @keydown.tab="goNextCaption"
      max="255"
    ></div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';
import { Caption } from '../types/Caption';

@Options({
})

export default class CaptionBar extends Vue {
  @Prop() caption!: Caption;
  @Prop() isActive!: boolean;
  @Prop() isCaptionBlur!: boolean;
  @Prop() isTranslationBlur!: boolean;
  @Prop() isSpellCheck!: boolean;
  @Prop() fontSize!: number;
  @Prop() index!: number;

  typingTimer!: any;          // timer identifier
  doneTypingInterval = 1000;  // time in ms
  captionBlur = "0 0 6px #111";

  mounted() {
  }

  @Watch('isActive')
  onActiveChange(value: boolean) {
    if (this.isActive) {
      // TODO: move it to the center
      const input = document.getElementById(`captionInput${this.index}`);
      if (input) {
        input.focus();
      }
    }
  }

  @Watch('isSpellCheck')
  onSpellCheckChange(value: boolean) {
    const id = `captionInput${this.index}`
    if (value === true) {
      this.spellCheck(id);
    } else {
      const inputDiv = document.querySelector(`#${id}`) as HTMLDivElement;
      const content = inputDiv.innerText;
      inputDiv.innerHTML = content;
    }
  }

  onCaptionClick(event: any) {
    this.$emit("caption-click", this.caption.startTimeMs);
  }

  // TODO: limit the size (# of chars) of caption bar input 
  // TODO: event that is triggered when user stops editing

  goPrevCaption(event: any) {
    event.preventDefault();
    this.$emit("prev-caption", this.index);
  }

  goNextCaption(event: any) {
    event.preventDefault();
    this.$emit("next-caption", this.index);
  }

  togglePlay(event: any) {
    event.preventDefault();
    this.$emit("toggle-play");
  }

  onBlur(event: Event) {
    if (this.isSpellCheck) {
      const id = (event.target as Element).id
      this.spellCheck(id);
    }
  }

  onSpace(event: Event) {
    if (this.isSpellCheck) {
      const id = (event.target as Element).id
      var restore = this.saveCaretPosition(id);
      this.spellCheck(id);
      restore(this);
    }
  }

  spellCheck(id: string) {
    const inputDiv = document.querySelector(`#${id}`) as HTMLDivElement;
    const inputRawText = inputDiv.innerHTML
      .replace(/<span style="color:#F05454;">/gi, '')
      .replace(/<\/?span>/gi, '')
      .replace(/<font color="#F05454">/gi, '')
      .replace(/<\/font>/gi, '')
      .replace(/&nbsp;/gi, '')
      .replace(/<br\/?>/gi, '');
    const inputWords = this.getWordsOfInput(inputRawText);
    const answerWords = this.getWordsOfAnswer(this.caption.text);

    inputDiv.innerHTML = "";
    let inner = "";
    for (let i = 0; i < inputWords.length; i++) {
      if (i < answerWords.length) {
        if (inputWords[i].replace(/[`~!@#$%^&*()_|+\-=?;:'",.\n\t\{\}\[\]\\]/gi, "").toLowerCase() 
          === answerWords[i].replace(/[`~!@#$%^&*()_|+\-=?;:'",.\n\t\{\}\[\]\\]/gi, "").toLowerCase()) {
          // good to go
          inner += inputWords[i] + " ";
        } else { // wrong
          inner += `<span style="color:#F05454;">${inputWords[i]} </span>`; // class="wrong"
        }
      } else { // wrong
        inner += `<span style="color:#F05454;>${inputWords[i]} </span>`; // class="wrong"
      }
    }
    inputDiv.innerHTML = inner;
  }

  onPaste(e: ClipboardEvent) {
    e.preventDefault();
    if (e.clipboardData) {
      const text = e.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
    }
  }

  //Not my functions...
  setEndOfContenteditable(contentEditableElement: HTMLElement) {
    var range,selection;
    if (document.createRange) { // Firefox, Chrome, Opera, Safari, IE 9+
      range = document.createRange(); // Create a range (a range is a like the selection but invisible)
      range.selectNodeContents(contentEditableElement); // Select the entire contents of the element with the range
      range.collapse(false); // collapse the range to the end point. false means collapse to end rather than the start
      selection = window.getSelection() as Selection; // get the selection object (allows you to change selection)
      selection.removeAllRanges(); // remove any selections already made
      selection.addRange(range); // make the range you have just created the visible selection
    }
  }

  saveCaretPosition(id: string) {
    var context = document.getElementById(id) as HTMLElement;
    var selection = window.getSelection() as Selection;
    var range = selection.getRangeAt(0);
    range.setStart(context, 0);
    var len = range.toString().length;

    return function restore(component: CaptionBar) {
      var pos = component.getTextNodeAtPosition(context, len);
      selection.removeAllRanges();
      var range = new Range();
      range.setStart(pos.node, pos.position);
      selection.addRange(range);
    }
  }

  getTextNodeAtPosition(root: any, index: any) {
    const NODE_TYPE = NodeFilter.SHOW_TEXT;
    var treeWalker = document.createTreeWalker(
      root,
      NODE_TYPE,
      {acceptNode: function next(elem: any): number {
        if (index > elem.textContent.length) {
          index -= elem.textContent.length;
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }}
    );
    var c = treeWalker.nextNode();
    return {
      node: c? c: root,
      position: index
    };
  }

  getWordsOfAnswer(text: string) {
    const refined = text.replace(/\n/g, " ");
    const words = refined.split(" ").filter(word =>
      word != "" //&& word.match(/[`~!@#$%^&*()_|+\-=?;:'",.\n\t\{\}\[\]\\]/gi) == null
    );
    return words;
  }

  getWordsOfInput(text: string) {
    const refined = text.replace(/&nbsp;/g, " ").replace(/\n/g, " ").replace(/<\/?span>/g, "");
    const words = refined.split(" ").filter(word => word != "");
    return words;
  }
}
</script>

<style lang="scss">
.caption-bar {
  /* height: 50px; */
  width: 500px;
  text-align: left;
  padding: 10px 10px;
  margin-bottom: 20px;
  border-radius: 7px;
  background-color: #e1e6ec;
}

.caption-bar--active {
  background-color: #afc7f1;
  // color: white;
}

.caption-bar__answer--blur {
  margin-bottom: 5px;
  color: #c6d6f3;
  // text-shadow: 0 0 12px #111;
  transition: 0.2s;

  span {
    background-color: #c6d6f3;
  }
}

.caption-bar__answer span:hover {
  color: #111;
  text-shadow: none;
  background-color: transparent;
}

.caption-bar__input {
  width: 100%;
  height: 25px;
  border: 1px solid #F6F5F5;
  background-color: #F5F9FB;
}

.caption-bar__input:focus {
  outline: none;
}

.wrong {
  color: red;
}

</style>
