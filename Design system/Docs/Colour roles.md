  
**COLOUR ROLES.**

**Tone count and why it is enough.**

The system uses tonal palettes with stops from 0 to 100, including intermediate tones such as 4, 6, 12, 17, 22, 24, 87, 92, 94 and 96 where needed. These tones provide enough range to create strong brand colours, subtle containers, layered surfaces, readable text and interactive states without introducing unrelated colours.

The system includes *primary*, *secondary*, *tertiary*, *neutral*, *neutral variant*, *error*, *warning* and *success* palettes. Semantic colour roles then point to specific tones in these palettes. This separates the purpose of a colour from its raw hex value and makes the system easier to maintain.

**Before and after pinning**

Before pinning, a colour can be selected directly from a palette whenever a component needs it. This can lead to inconsistent choices, repeated hex values and weak contrast between text and its background.

After pinning, each semantic role is connected to a specific palette tone. Components can use roles such as primary, on-primary, surface and on-surface instead of choosing colours independently. This creates a more consistent interface and makes colour changes easier to manage centrally.

**ROLE TABLE**

**Role \| Palette tone \| Hex value**

Primary \| Primary 40 \| \#16A34A  
On primary \| Primary 99 \| \#F9FFF5  
Primary container \| Primary 90 \| \#AAFFB3  
On primary container \| Primary 30 \| \#007933

Secondary \| Secondary 40 \| \#006D36  
On secondary \| Secondary 99 \| \#F5FFF3  
Secondary container \| Secondary 90 \| \#6DFE9C  
On secondary container \| Secondary 30 \| \#005227

Tertiary \| Tertiary 40 \| \#1F6C3A  
On tertiary \| Tertiary 100 \| \#FFFFFF  
Tertiary container \| Tertiary 90 \| \#A6F4B5  
On tertiary container \| Tertiary 30 \| \#005226

Error \| Error 40 \| \#BA1A1A  
On error \| Error 99 \| \#FFFBFF  
Error container \| Error 90 \| \#FFDAD5  
On error container \| Error 30 \| \#930009

Surface \| Neutral 98 \| \#EEFDF0  
On surface \| Neutral 10 \| \#121E17  
Surface variant \| Neutral Variant 90 \| \#D3E8D8  
On surface variant \| Neutral Variant 30 \| \#394B40

Surface container highest \| Neutral 90 \| \#D7E6DA  
Surface container high \| Neutral Variant 92 \| \#DDE CDF  
Surface container \| Neutral Variant 94 \| \#E3F2E5  
Surface container low \| Neutral Variant 96 \| \#E8F8EB  
Surface container lowest \| Neutral 100 \| \#FFFFFF

Inverse surface \| Neutral 20 \| \#26332B  
Inverse on surface \| Neutral 95 \| \#E5F5E8  
Surface tint \| Primary 40 \| \#16A34A  
Outline \| Neutral Variant 70 \| \#9CB0A2  
Outline variant \| Neutral Variant 90 \| \#D3E8D8

Primary fixed \| Primary 90 \| \#AAFFB3  
On primary fixed \| Primary 10 \| \#002C0E  
Primary fixed dim \| Primary 80 \| \#74F18D  
On primary fixed dim \| Primary 30 \| \#007933  
Inverse primary \| Primary 80 \| \#74F18D

Secondary fixed \| Secondary 90 \| \#6DFE9C  
On secondary fixed \| Secondary 10 \| \#00210C  
Secondary fixed dim \| Secondary 80 \| \#4DE082  
On secondary fixed variant \| Secondary 30 \| \#005227

Tertiary fixed \| Tertiary 90 \| \#A6F4B5  
On tertiary fixed \| Tertiary 10 \| \#00210B  
Tertiary fixed dim \| Tertiary 80 \| \#8BD79B  
On tertiary fixed variant \| Tertiary 30 \| \#005226

Background \| Neutral 98 \| \#EEFDF0  
On background \| Neutral 10 \| \#121E17  
Surface bright \| Neutral 80 \| \#BBCABE  
Surface dim \| Neutral Variant 87 \| \#CFDED1  
Scrim \| Neutral 0 \| \#000000  
Shadow \| Neutral 0 \| \#000000

Success \| Success 40 \| \#006B5B  
On success \| Success 100 \| \#FFFFFF  
Success container \| Success 90 \| \#9FF2DE  
On success container \| Success 10 \| \#00201A

