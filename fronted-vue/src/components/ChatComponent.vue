<template>
    <div class="message-box">

        <div v-for="message in messages" :key="message.model">
            <div v-if="message.typeMessage === 'bot'" class="message">
                <div class="bot-message">
                    <p>{{ message.prompt }}</p>
                </div>
            </div>
            <div v-else-if="message.typeMessage === 'user'" class="message">
                <div class="user-message">
                    <p>{{ message.prompt }}</p>
                </div>
            </div>
        </div>
    </div>

    <div class="input-form">
        <div class="label-text">
            <h1>Enter the message</h1>
            <h1>{{ countLetters }} / {{ limitCharacters }}</h1>
        </div>
        <div class="form-area">
            <textarea @keyup.enter="sendMessage" v-model="input_text" class="form-textarea"
                :maxlength="limitCharacters"></textarea>
            <div class="img-place">

                <div class="flex flex-row">

                    <div v-for="image in loadedImages" :key="image">
                        <img class="loaded-image" v-if="typeof image === 'string'" :src="image" alt="Image">
                    </div>
                </div>

                <img @click="loadImage" class="load-image-button" src="@/assets/img/image-solid.svg"
                    alt="description of image">
                <input @change="onFileSelected" type="file" accept="image/x-png,image/gif,image/jpeg" ref="fileInputImg"
                    hidden />


            </div>
        </div>
    </div>
</template>


<script lang="ts">
import { OllamaRequester } from '@/scripts/OllamaRequester';
import { Message } from '@/scripts/shemas';
import mitt from 'mitt';
import { defineComponent } from 'vue';


export default defineComponent({
    data() {
        return {
            ollamaRequester: new OllamaRequester(),
            mittEmmiter: mitt(),
            messages: [] as Array<Message>,
            input_text: "" as string,
            modelName: "",
            loadedImages: [] as Array<string>,
            bot_count_responses: 0,
            response_message: "",
            limitCharacters: 2000,
            blockTyping: false,

        }
    },
    beforeMount() {
        this.ollamaRequester.setMittEmmiter(this.mittEmmiter);
        this.mittEmmiter.on('generateMessage', (e) => this.generateMessage(e))
        this.mittEmmiter.on('generateMessageDone', () => this.generateMessageDone())

    },

    computed: {
        countLetters(): number {
            return this.input_text.length;

        }
    },
    methods: {

        loadImage() {
            (this.$refs.fileInputImg as HTMLInputElement).click();

        },
        onFileSelected(event: any) {

            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (e.target && typeof (e.target.result) === 'string') {

                        this.loadedImages.push(e.target.result);
                    }
                };
                reader.readAsDataURL(file);
            }
        },

        sendMessage() {

            if (this.blockTyping === false) {
                this.blockTyping = true
            }else{
                return
            }

            this.modelName = this.loadedImages.length === 0 ? 'llama2' : 'llava';

            const loadedImages = []
            for (let i = 0; i < this.loadedImages.length; i++) {
                loadedImages.push(this.loadedImages[i].replace("data:image/png;base64,", ""));
            }

            const UserMessage: Message = {
                typeMessage: "user",
                model: this.modelName,
                prompt: this.input_text,
                images: loadedImages

            }
            this.messages.push(UserMessage);
            this.input_text = "";

            this.ollamaRequester.sendMessage(UserMessage);

        },
        async generateMessage(streamData: any) {
            try {
                const jsonData = JSON.parse(streamData);

                if (this.bot_count_responses === 0) {
                    const botMessage: Message = {
                        typeMessage: "bot",
                        model: jsonData.model,
                        prompt: jsonData.response,
                    }
                    this.messages.push(botMessage)
                } else {
                    this.messages[this.messages.length - 1].prompt = this.messages[this.messages.length - 1].prompt + jsonData.response;
                }

                this.bot_count_responses = this.bot_count_responses + 1;


            } catch (e) { }
        },
        async generateMessageDone() {
            this.bot_count_responses = 0;
            this.blockTyping = false;
        }

    }
})

</script>

<style>
@import "@/assets/css/message-box.css";
@import "@/assets/css/input-form.css";
</style>
