---
description: Dikkat edilmesi gerekenler
---
Dikkat et:
Tüm değişkenler camelCase olmalı.
Değişkenleri doğru şekilde kullanmalısın.
Örneğin veritabanına kaydederken readTime ise.
Başka bir sayfada veritabanından çekilirken totalReadTime ya da readingTime olmamalı.
Consistency'e özen göstermelisin.


ZORUNLU NAMING & CONSISTENCY KURALI

Tüm değişkenler camelCase olmak zorundadır (frontend, backend, database, API, testler dahil).

Bir değişken ilk tanımlandığı isimle projenin her yerinde birebir aynı kullanılmalıdır.
Değişken adı her yerde aynı olmalı.

Alternatif veya daha açıklayıcı isim üretmek yasaktır.


♻️ Refactor Kuralı

İsim değişikliği yapılacaksa global olarak yapılmalıdır.

Tek bir dosyada kalan eski isim kritik hatadır.

Refactor sonrası build + test + runtime kontrolü zorunludur.

🚨 Kritik Hata Tanımı:
camelCase ihlali, aynı veri için farklı isim, katmanlar arası isim uyuşmazlığı.
Bu hatalar çözülmeden agent ilerleyemez.