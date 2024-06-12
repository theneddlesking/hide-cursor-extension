function hideCursor() {
    document.body.style.cursor = 'none';
}

function showCursor() {
    document.body.style.cursor = 'auto';
}

function handleMouseMove() {
    if (document.body.style.cursor === 'none') {
        showCursor();
    }

    clearTimeout(window.hideCursorTimeout);

    window.hideCursorTimeout = setTimeout(() => {
        hideCursor();
    }, 1000);
}

hideCursor();
document.addEventListener('mousemove', handleMouseMove);
