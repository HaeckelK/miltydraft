$(document).ready(function() {

    $('#tabs nav a').on('click', function(e) {
        e.preventDefault();
        $('#tabs nav a, .tab').removeClass('active');
        $(this).addClass('active');
        $('.tab' + $(this).attr('href')).addClass('active');
    });

    $('button.draft').on('click', function(e) {
        e.preventDefault();

        if(typeof(me) == 'undefined') return;

        window.draft_pick = {
            'id': draft.id,
            'player': (IS_ADMIN)? draft.draft.current : me.id,
            'category': $(this).data('category'),
            'value': $(this).data('value')
        };

        if(IS_ADMIN) {
            draft_pick.admin = localStorage.getItem('admin_' + draft.id);
        }

        $('#confirm-category').html(draft_pick.category);

        let show_value = draft_pick.value;

        if(draft_pick.category == "slice") {
            show_value = parseInt(draft_pick.value) + 1;
        } else if(draft_pick.category == "position") {
            show_value = (draft_pick.value == 0)? 'speaker' : ordinal(parseInt(draft_pick.value) + 1);
        }

        $('#confirm-value').html(show_value);

        $('#confirm-popup').show();
    })

    $('#confirm-cancel').on('click', function(e) {
        $('#confirm-popup').hide();
    });
    $('#confirm').on('click', function(e) {
        $('button.draft').hide();
        $('#confirm-popup').hide();
        $.ajax({
            type: "POST",
            url: window.routes.pick,
            dataType: 'json',
            data: draft_pick,
            success: function(resp) {
                if(resp.error) {
                    $('#error-message').html(resp.error);
                    $('#error-popup').show();
                }

                if(resp.success) {
                    window.draft = resp.draft;
                    refresh();
                }
            }
        })
    });

    $('#close-error').on('click', function(e) {
        $('#error-popup').hide();
    })


    if(window.draft) {
        who_am_i();
        draft_status();

        $('.claim').on('click', function(e) {
            $(this).hide();
            $.ajax({
                type: 'POST',
                url: window.routes.claim,
                dataType: 'json',
                data: {
                    'draft': draft.id,
                    'player': $(this).data('id')
                },
                success: function(resp) {
                    if(resp.error) {
                        $('#error-message').html(resp.error);
                        $('#error-popup').show();
                    } else {
                        window.draft = resp.draft;
                        localStorage.setItem('draft_' + draft.id, resp.player);
                        refresh();
                    }

                }
            });
        });

        $('.unclaim').on('click', function(e) {
            $(this).hide();
            $.ajax({
                type: 'POST',
                url: window.routes.claim,
                dataType: 'json',
                data: {
                    'draft': draft.id,
                    'player': $(this).data('id'),
                    'unclaim': 1
                },
                success: function(resp) {
                    if(resp.error) {
                        $('#error-message').html(resp.error);
                        $('#error-popup').show();
                    } else {
                        window.draft = resp.draft;
                        localStorage.removeItem('draft_' + draft.id);
                        refresh();
                    }
                }
            });
        })
    }
});

function refresh() {
    who_am_i();
    draft_status();
}

function who_am_i() {
    var player_id = localStorage.getItem('draft_' + draft.id);
    var admin_id =  localStorage.getItem('admin_' + draft.id);

    window.IS_ADMIN = (admin_id == draft.admin_pass);

    if(IS_ADMIN) $('#admin-msg').show();

    $('.unclaim').hide();

    if(player_id == null) {
        for(p_id in draft.draft.players) {
            let p = draft.draft.players[p_id];

            if (p.claimed == false) {
                $('.claim[data-id="' + p.id + '"]').show();
            } else {
                $('.claim[data-id="' + p.id + '"]').hide();
            }
        }
    } else {
        $('.claim').hide();
        let p = draft.draft.players[player_id];
        if(typeof(p) != 'undefined') {
            window.me = p;
            $('.you[data-id="' + me.id + '"]').show();
        }
    }
}

function draft_status() {
    let current_player = draft.draft.players[draft.draft.current];

    let log = '';
    for(let i = 0; i < draft.draft.log.length; i++) {
        let log_item = draft.draft.log[i];
        let p = draft.draft.players[log_item.player];

        let show_value = log_item.value;

        if(log_item.category == "slice") {
            show_value = "slice " + (parseInt(log_item.value) + 1);
        } else if(log_item.category == "position") {
            show_value = (log_item.value == 0)? 'speaker' : ordinal(parseInt(log_item.value) + 1) + " position";
        }

        $('#player-' + p.id + ' .chosen-' + log_item.category).html(show_value);
        console.log($('#player-' + p.id + ' .chosen-' + log_item.category));
        let $btn = $('button[data-category="' + log_item.category + '"][data-value="' + log_item.value + '"]');
        $btn.prop('disabled', true);
        $btn.parents('.option').addClass('picked');

        log += '<p>' + p.name + ' picked ' + show_value + '</p>';
    }

    $('#log-content').html(log);

    if(draft.done) {
        $('#turn').removeClass('show');
        $('#done').addClass('show');
    } else {
        $('#turn').addClass('show');
    }

    $('.player').removeClass('active');
    $('#player-' + current_player.id).addClass('active');

    if(IS_ADMIN) {
        $('button.draft').show();
        $('#current-name').html(current_player.name + "'s");
    } else {
        if(typeof(me) != 'undefined' &&  current_player.id == me.id) {
            // IT'S MY TURN!
            $('button.draft').show();
            $('#current-name').html('your');
        } else {
            $('button.draft').hide();
            $('#current-name').html(current_player.name + "'s");
        }
    }
}

function ordinal(number) {
    let ends = ['th','st','nd','rd','th','th','th','th','th','th'];
    console.log(number);
    if (((number % 100) >= 11) && ((number%100) <= 13))
        return number + 'th';
    else
        return number + ends[number % 10];
}