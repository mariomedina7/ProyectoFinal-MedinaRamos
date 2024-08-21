const { computePosition, offset, flip, shift } = window.FloatingUIDOM;

const buttons = document.querySelectorAll('.tooltip-btn');

buttons.forEach(button => {
    const tooltipId = button.getAttribute('data-tooltip-id');
    const tooltip = document.querySelector(`#${tooltipId}`);

    button.addEventListener('mouseenter', () => {
        tooltip.style.display = 'block';

        computePosition(button, tooltip, {
            placement: 'top',
            middleware: [offset(10), flip(), shift()],
        }).then(({ x, y }) => {
            Object.assign(tooltip.style, {
                left: `${x}px`,
                top: `${y}px`,
            });
        });
    });

    button.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
    });
});

