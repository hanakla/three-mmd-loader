export default class DataCreationHelper
{
    /**
     * Note: Sometimes to use Japanese Unicode characters runs into problems in Three.js.
     *       In such a case, use this method to convert it to Unicode hex charcode strings,
     *       like 'あいう' -> '0x30420x30440x3046'
     */
    toCharcodeStrings(s)
    {
        var str = '';

        for (var i = 0; i < s.length; i++)
        {
            str += '0x' + ('0000' + s[i].charCodeAt().toString(16)).substr(-4);

        }

        return str;
    }

    createDictionary(array)
    {
        var dict = {};

        for (var i = 0; i < array.length; i++)
        {
            dict[array[i].name] = i;

        }

        return dict;
    }

    initializeMotionArrays(array)
    {
        var result = [];

        for (var i = 0; i < array.length; i++)
        {
            result[i] = [];

        }

        return result;
    }

    sortMotionArray(array)
    {
        array.sort(function (a, b)
        {
            return a.frameNum - b.frameNum;

        });
    }

    sortMotionArrays(arrays)
    {
        for (var i = 0; i < arrays.length; i++)
        {
            this.sortMotionArray(arrays[i]);

        }
    }

    createMotionArray(array)
    {
        var result = [];

        for (var i = 0; i < array.length; i++)
        {
            result.push(array[i]);

        }

        return result;
    }

    createMotionArrays(array, result, dict, key)
    {
        for (var i = 0; i < array.length; i++)
        {
            var a = array[i];
            var num = dict[a[key]];

            if (num === undefined)
            {
                continue;

            }

            result[num].push(a);

        }
    }

    createOrderedMotionArray(array)
    {
        var result = this.createMotionArray(array);
        this.sortMotionArray(result);
        return result;
    }

    createOrderedMotionArrays(targetArray, motionArray, key)
    {
        var dict = this.createDictionary(targetArray);
        var result = this.initializeMotionArrays(targetArray);
        this.createMotionArrays(motionArray, result, dict, key);
        this.sortMotionArrays(result);

        return result;
    }
}