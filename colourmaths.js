function Clamp(val, min, max)
{
	return Math.min(max, Math.max(min, val));
}

function ToHex(rgb)
{
	console.log("RGB, ", rgb);
	console.log("R, G, B, ", rgb.r, rgb.g, rgb.b);
	var intr = Math.floor(rgb.r * 255);
	var intg = Math.floor(rgb.g * 255);
	var intb = Math.floor(rgb.b * 255);
	console.log(intr, intg, intb);

	return "#" + ((1<<24) | (intr<<16) | (intg<<8) | intb).toString(16).substr(1);
}

function ToFloat(hex)
{
	var numpart = hex.substring(1);
	var r = parseInt(numpart.substring(0,2), 16) / 255.0;
	var g = parseInt(numpart.substring(2,4), 16) / 255.0;
	var b = parseInt(numpart.substring(4,6), 16) / 255.0;
	return {r, g, b};
}

function Linearise(c)
{
	if (c <= 0.0031308)
	{
		return 12.92 * c;
	}
	else
	{
		return 1.055 * Math.pow(c, 1.0 / 2.4) - 0.055;
	}
}

function lRGB(rgb)
{
	var r = Linearise(rgb.r);
	var g = Linearise(rgb.g);
	var b = Linearise(rgb.b);
	return {r, g, b};
}

function GammaCorrect(c)
{
	if (c <= 0.04045)
	{
		return c / 12.92;
	}
	else
	{
		return Math.pow((c + 0.055)/1.055, 2.4);
	}
}

function sRGB(rgb)
{
	var r = GammaCorrect(rgb.r);
	var g = GammaCorrect(rgb.g);
	var b = GammaCorrect(rgb.b);
	return {r, g, b};
}

//-----------------------------------------------------------------------
// Calculate perceptual luminance of colour
//-----------------------------------------------------------------------
function Luminance(c)
{
	// Rec.709 D65
	return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
}

//-----------------------------------------------------------------------
// Calculates an RGB colour from HSL
//-----------------------------------------------------------------------
function RGBToHSL(rgb)
{
    var c = lRGB(rgb);
    var max = Math.max(c.r, c.g, c.b);
    var min = Math.min(c.r, c.g, c.b);
	var range = max - min;

    var h, s, l;
	if (c.r == c.g && c.g == c.b)
	{
		h = 0;
	}
	else if (c.r == max)
	{
		h = (c.g - c.b) / range;
	}
	else if (c.g == max)
	{
		h = 2.0 + (c.b - c.r) / range;
	}
	else
	{
		h = 4.0 + (c.r - c.g) / range;
	}

    h = (h * 60.0 + 360.0) % 360.0;

    l = (max + min) / 2.0;

    if (min == 1 || max == 0)
    {
        s = 0;
    }
    else
    {
        s = (max - l) / Math.min(l, 1 - l);
    }

    return {h, s, l};
}

function HSLToRGB(h, s, l)
{
	var C = (1.0 - Math.abs(2.0 * l - 1.0)) * s;
	var X = C * (1.0 - Math.abs( ((h / 60.0) % 2.0) - 1.0));
	var m = l - C / 2.0;

	var r, g, b;
	if (h < 60)				r = C, g = X, b = 0;
	else if (h < 120)		r = X, g = C, b = 0;
	else if (h < 180)		r = 0, g = C, b = X;
	else if (h < 240)		r = 0, g = X, b = C;
	else if (h < 300)		r = X, g = 0, b = C;
	else					r = C, g = 0, b = X;

    r += m;	g += m;	b += m;
    
	return sRGB({r, g, b});
}