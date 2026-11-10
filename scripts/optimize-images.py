"""Build responsive WebP copies without changing original photos or img src.

Run: python scripts/optimize-images.py
Check generated files and HTML: python scripts/optimize-images.py --check
Pillow is a development dependency; the website needs no Python or image library.
"""
import argparse
import html
import re
from html.parser import HTMLParser
from math import ceil
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
PAGES = ['index.html', 'aktau.html', 'astana.html', 'almaty.html', 'shymkent.html', 'about.html']
IMG_TAG = re.compile(r'<img\b[^>]*>', re.IGNORECASE)
WIDTHS = (480, 960, 1600)
THUMBNAIL_WIDTHS = (192, 288)
OUTPUT = Path('assets/optimized')


class ImageTag(HTMLParser):
    def handle_starttag(self, tag, attrs):
        self.attrs = dict(attrs)


def attributes(tag):
    parser = ImageTag()
    parser.feed(tag)
    return parser.attrs


def source_images():
    sources = set()
    thumbnails = set()
    for page in PAGES:
        for tag in IMG_TAG.findall((ROOT / page).read_text(encoding='utf-8')):
            attrs = attributes(tag)
            sources.add(attrs['src'])
            if attrs.get('alt') == '':
                thumbnails.add(attrs['src'])
    return sorted(sources), thumbnails


def variants(source, width, thumbnail=False):
    # Include the original width when it falls between target sizes; never upscale.
    widths = (*THUMBNAIL_WIDTHS, *WIDTHS) if thumbnail else WIDTHS
    return [(OUTPUT / Path(source).relative_to('images').parent /
             f'{Path(source).stem}-{size}.webp', size)
            for size in sorted({min(target, width) for target in widths})]


def image_sizes(attrs, page, dimensions):
    classes = attrs.get('class', '').split()
    if 'hero-bg-img' in classes:
        width, height = dimensions[attrs['src']]
        desktop_height = 570 if page == 'index.html' else 520
        # Cover crops still need enough source pixels for the image's scaled width.
        return (f'(max-width: 399px) max(calc(100vw - 48px), {ceil(280 * width / height)}px), '
                f'(max-width: 767.98px) max(calc(100vw - 48px), {ceil(310 * width / height)}px), '
                f'(max-width: 991.98px) max(calc(54vw - 32.4px), {ceil(460 * width / height)}px), '
                f'(max-width: 1199px) max(calc(57vw - 54.72px), {ceil(500 * width / height)}px), '
                f'max(min(calc(57vw - 54.72px), 729.6px), {ceil(desktop_height * width / height)}px)')
    if 'feature-circle' in classes:
        return '(max-width: 527px) calc(100vw - 48px), 480px'
    if attrs.get('alt') == '':
        return '(max-width: 767.98px) 66px, 86px'
    if 'carousel-photo' in classes:
        return ('(min-width: 1376px) 1280px, (min-width: 992px) calc(100vw - 96px), '
                '(min-width: 768px) calc(100vw - 60px), calc(100vw - 48px)')
    if 'card-img-top' in classes:
        columns = 4 if page == 'index.html' else 3
        desktop_width = 302 if columns == 4 else 410.667
        desktop_spacing = 96 + 24 * (columns - 1)
        small_columns = ('(min-width: 576px) calc((100vw - 72px) / 2), '
                         if page in ['index.html', 'about.html'] else '')
        return (f'(min-width: 1376px) {desktop_width}px, '
                f'(min-width: 992px) calc((100vw - {desktop_spacing}px) / {columns}), '
                '(min-width: 768px) calc((100vw - 84px) / 2), '
                f'{small_columns}'
                'calc(100vw - 48px)')
    return ('(min-width: 1376px) 416px, (min-width: 992px) calc((100vw - 128px) / 3), '
            '(min-width: 768px) calc((100vw - 76px) / 2), '
            '(min-width: 576px) calc((100vw - 64px) / 2), calc(100vw - 48px)')


def expected_attributes(attrs, page, dimensions):
    width, height = dimensions[attrs['src']]
    leading = any(name in attrs.get('class', '').split()
                  for name in ['hero-bg-img', 'feature-circle'])
    result = {'width': str(width), 'height': str(height),
              'loading': 'eager' if leading else 'lazy', 'decoding': 'async'}
    if leading:
        result['fetchpriority'] = 'high'
    if (ROOT / attrs['src']).stat().st_size >= 30_000:
        result['srcset'] = ', '.join(f'{path.as_posix()} {size}w'
                                     for path, size in variants(attrs['src'], width, attrs.get('alt') == ''))
        result['sizes'] = image_sizes(attrs, page, dimensions)
    return result


def set_attribute(tag, name, value):
    attribute = f'{name}="{html.escape(value, quote=True)}"'
    pattern = rf'(?<![\w-]){name}="[^"]*"'
    if re.search(pattern, tag):
        return re.sub(pattern, lambda match: attribute, tag)
    closing = '/>' if tag.endswith('/>') else '>'
    return tag[:-len(closing)] + ' ' + attribute + closing


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Verify without writing files.')
    parser.add_argument('--reuse-existing', action='store_true',
                        help='Keep validated existing variants; build only missing sizes and update HTML.')
    args = parser.parse_args()
    check = args.check
    dimensions = {}
    original_bytes = largest_bytes = generated_bytes = generated_count = 0
    sources, thumbnails = source_images()
    for source in sources:
        with Image.open(ROOT / source) as photo:
            image = ImageOps.exif_transpose(photo).convert('RGB')
        dimensions[source] = image.size
        if (ROOT / source).stat().st_size < 30_000:
            continue
        original_bytes += (ROOT / source).stat().st_size
        outputs = variants(source, image.width, source in thumbnails)
        for relative, width in outputs:
            target = ROOT / relative
            height = round(image.height * width / image.width)
            if not check and (not args.reuse_existing or not target.exists()):
                target.parent.mkdir(parents=True, exist_ok=True)
                resized = image.resize((width, height), Image.Resampling.LANCZOS)
                # A few highly compressed originals need a lower quality to save bytes.
                for quality in (82, 78, 74, 70):
                    resized.save(target, format='WEBP', quality=quality, method=6)
                    if target.stat().st_size < (ROOT / source).stat().st_size:
                        break
            if not target.is_file():
                raise SystemExit(f'Missing responsive photo: {relative}')
            with Image.open(target) as copy:
                if copy.format != 'WEBP' or copy.size != (width, height):
                    raise SystemExit(f'Invalid responsive photo: {relative}')
                copy.verify()
            if target.stat().st_size >= (ROOT / source).stat().st_size:
                raise SystemExit(f'Responsive photo is larger than its original: {relative}')
            generated_count += 1
            generated_bytes += target.stat().st_size
        largest_bytes += (ROOT / outputs[-1][0]).stat().st_size

    image_count = 0
    for page in PAGES:
        path = ROOT / page
        original = path.read_text(encoding='utf-8')

        def update(match):
            nonlocal image_count
            tag = match.group()
            attrs = attributes(tag)
            for name, value in expected_attributes(attrs, page, dimensions).items():
                if check and attrs.get(name) != value:
                    raise SystemExit(f'{page}: incorrect {name} on {attrs["src"]}')
                tag = set_attribute(tag, name, value)
            image_count += 1
            return tag

        updated = IMG_TAG.sub(update, original)
        if not check and updated != original:
            path.write_text(updated, encoding='utf-8')

    action = 'PASS' if check else 'BUILT'
    print(f'{action}: {generated_count} responsive files; {image_count} images across {len(PAGES)} pages.')
    print(f'Unique original photos: {original_bytes:,} bytes; largest responsive copies: {largest_bytes:,} bytes '
          f'({100 * (1 - largest_bytes / original_bytes):.1f}% smaller).')
    print(f'All responsive variants together: {generated_bytes:,} bytes. Original files and img src are retained.')


if __name__ == '__main__':
    main()
