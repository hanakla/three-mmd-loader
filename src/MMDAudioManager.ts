export default class MMDAudioManager
{
    constructor(audio, listener, p)
    {
        var params = (p === null || p === undefined) ? {} : p;

        this.audio = audio;
        this.listener = listener;

        this.elapsedTime = 0.0;
        this.currentTime = 0.0;
        this.delayTime = params.delayTime !== undefined ? params.delayTime : 0.0;

        this.audioDuration = this.audio.buffer.duration;
        this.duration = this.audioDuration + this.delayTime;
    }

    control(delta)
    {
        this.elapsed += delta;
        this.currentTime += delta;

        if (this.checkIfStopAudio())
        {
            this.audio.stop();

        }

        if (this.checkIfStartAudio())
        {
            this.audio.play();

        }
    }

    checkIfStartAudio()
    {
        if (this.audio.isPlaying)
        {
            return false;

        }

        while (this.currentTime >= this.duration)
        {
            this.currentTime -= this.duration;

        }

        if (this.currentTime < this.delayTime)
        {
            return false;

        }

        this.audio.startTime = this.currentTime - this.delayTime;

        return true;
    }

    checkIfStopAudio()
    {
        if (!this.audio.isPlaying)
        {
            return false;

        }

        if (this.currentTime >= this.duration)
        {
            return true;

        }

        return false;
    }
}