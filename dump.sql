create table posts
(
    id         serial
        constraint posts_pk
            primary key,
    group_id   integer                                not null,
    text       text                                   not null,
    created_by integer                                not null,
    created_at timestamp(6) default CURRENT_TIMESTAMP not null,
    updated_at timestamp(6) default CURRENT_TIMESTAMP not null
);

alter table posts
    owner to postgres;

create table comments
(
    id         serial
        constraint comments_pk
            primary key,
    post_id    integer                                not null
        constraint comments_posts_id_fk
            references posts,
    text       text                                   not null,
    created_by integer                                not null,
    created_at timestamp(6) default CURRENT_TIMESTAMP not null,
    updated_at timestamp(6) default CURRENT_TIMESTAMP not null
);

alter table comments
    owner to postgres;